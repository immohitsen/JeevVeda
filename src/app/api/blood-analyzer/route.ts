import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Part } from '@google/genai';
import { connect } from '@/dbConfig/dbConfig';
import Report from '@/models/reportModel';
import jwt from 'jsonwebtoken';
// Polyfill for pdfjs-dist in Node.js environment
// eslint-disable-next-line @typescript-eslint/no-require-imports
const canvas = require('canvas');
// Polymorph global objects expected by pdfjs-dist
if (!global.DOMMatrix) {
  (global as any).DOMMatrix = canvas.DOMMatrix;
}
if (!global.Image) {
  (global as any).Image = canvas.Image;
}
if (!global.HTMLCanvasElement) {
  (global as any).HTMLCanvasElement = canvas.Canvas;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsLib = require('pdfjs-dist');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ---- Initialize Google Gen AI client ----
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? '',
});

// Connect to database
connect();

interface AnalysisResult {
  patientInfo?: {
    name?: string | null;
    age?: number | null;
    gender?: string | null;
    reportDate?: string | null;
  };
  testResults?: Array<{
    category: string;
    tests: Array<{
      testName: string;
      value: string | number;
      unit: string;
      referenceRange: string;
      status: string;
    }>;
  }>;
  cancerRiskAssessment?: {
    overallRisk: string;
    riskFactors: Array<{
      factor: string;
      value: string;
      significance: string;
      riskLevel: string;
    }>;
    cancerTypes: Array<{
      type: string;
      riskLevel: string;
      indicators: string[];
    }>;
    recommendations: string[];
  };
  otherHealthRisks?: Array<{
    condition: string;
    risk: string;
    indicators: string[];
    description: string;
  }>;
  insights?: string[];
  overallAssessment?: string;
  error?: string;
}

// --- Build prompt for Gemini 3.0 Flash ---
function buildPrompt(isTextMode: boolean) {
  return `
    You are an expert medical-report analyst using the Gemini 3.0 engine.
    You are given a blood test report as ${isTextMode ? 'EXTRACTED TEXT' : 'an IMAGE/DOCUMENT'}.

    Your job is to:
    1. Analyze the ${isTextMode ? 'text' : 'document'} for patient details, test results, and health risks.
    2. Return the result strictly as a JSON object matching the schema below.
    ${isTextMode ? 'Note: The text may have OCR errors or formatting issues. Try to reconstruct the context and extract meaningful data.' : ''}

    Required JSON Structure:
    {
      "patientInfo": {
        "name": "string or null",
        "age": "number or null",
        "gender": "string or null",
        "reportDate": "string or null"
      },
      "testResults": [
        {
          "category": "string (e.g. 'CBC', 'Lipid Profile', 'Liver Function')",
          "tests": [
            {
              "testName": "string",
              "value": "string or number",
              "unit": "string",
              "referenceRange": "string",
              "status": "normal|high|low|critical|unknown"
            }
          ]
        }
      ],
      "cancerRiskAssessment": {
        "overallRisk": "low|moderate|high|low_to_moderate",
        "riskFactors": [
          {
            "factor": "string",
            "value": "string",
            "significance": "string",
            "riskLevel": "low|moderate|high"
          }
        ],
        "cancerTypes": [
          {
            "type": "string",
            "riskLevel": "low|moderate|high",
            "indicators": ["string"]
          }
        ],
        "recommendations": ["string"]
      },
      "otherHealthRisks": [
        {
          "condition": "string",
          "risk": "low|moderate|high",
          "indicators": ["string"],
          "description": "string"
        }
      ],
      "insights": ["string (AI generated health insights)"],
      "overallAssessment": "string (summary)"
    }

    Important Guidelines:
    - Return ONLY valid JSON, no markdown formatting.
    - Status values MUST be lowercase: normal, high, low, critical, unknown.
    - Risk levels MUST be lowercase: low, moderate, high.
    - "testResults" should be grouped by category (e.g., CBC, KFT, LFT).
    - If a specific field is not found, use null.
    - **CRITICAL**: If no specific cancer markers or abnormal cell counts are found, set "overallRisk" to "low". DO NOT use "unable_to_determine".
    - If the report is normal, emphasize the "Low Risk" status positively.
    - Be precise with medical terminology.
    `;
}

// --- Async PDF Parser Function using pdfjs-dist with polyfills ---
async function parsePDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Convert Buffer to Uint8Array
    const data = new Uint8Array(buffer);

    // Load document
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      verbosity: 0 // Suppress warnings
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = '';

    // Iterate through pages
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();

      // Extract strings from text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('PDF parsing error:', error);
    // If parsing fails, throw so we can fallback to vision API
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let contentParts: Part[] = [];
    let isTextMode = false;

    // ===== PDF Processing =====
    if (file.type === 'application/pdf') {
      try {
        console.log("🔄 Parsing PDF with PDFParse...");

        // Use PDFParse function to extract text
        const extractedText = await parsePDFBuffer(fileBuffer);

        if (!extractedText || extractedText.trim().length < 50) {
          console.warn("PDF text too short or empty. Likely a scanned document. Falling back to vision analysis.");
          throw new Error("SCANNED_PDF_FALLBACK");
        }

        isTextMode = true;
        contentParts = [
          { text: buildPrompt(true) },
          { text: `\n\nExtracted Blood Report Text:\n${extractedText}` }
        ];

        console.log("PDF Text Extracted successfully, length:", extractedText.length);

      } catch (err: unknown) {
        console.log("Switching to PDF-as-Document analysis (Fallback mode)", err);

        // Fallback: Send the PDF as base64 data (Gemini can read PDFs directly)
        const base64Data = fileBuffer.toString('base64');
        isTextMode = false;

        contentParts = [
          { text: buildPrompt(false) },
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          }
        ];

        console.log("✅ PDF prepared for vision analysis");
      }
    }
    // ===== Image Processing =====
    else {
      const base64Data = fileBuffer.toString('base64');
      isTextMode = false;

      contentParts = [
        { text: buildPrompt(false) },
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        }
      ];

      console.log("✅ Image processed, ready for analysis");
    }

    // ===== Gemini 3.0 Flash API Call =====
    console.log("🔄 Calling Gemini 3.0 Flash API...");

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // ✅ Using Gemini 2.0 Flash as per documentation recommendation
      contents: contentParts,
      config: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });
    console.log(response);
    const responseText = response.text;

    if (!responseText) {
      throw new Error('No text content received from the model');
    }

    console.log('✅ AI Response received (Gemini 3.0 Flash):', responseText.substring(0, 200) + '...');

    let analysisResult: AnalysisResult;

    // ===== Parse JSON Response =====
    try {
      let jsonText = responseText.trim();

      // Cleanup markdown formatting if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      analysisResult = JSON.parse(jsonText);
      console.log('✅ JSON parsed successfully');

    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw response:', responseText);

      // Return structured error
      analysisResult = {
        patientInfo: { name: null },
        testResults: [],
        insights: ['Error parsing AI response. The model may have returned invalid JSON.'],
        overallAssessment: 'Failed to process report structure.',
        error: 'PARSE_ERROR'
      };
    }

    // ===== Validate Results =====
    const hasResults = Array.isArray(analysisResult.testResults)
      && analysisResult.testResults.length > 0;

    if (!hasResults && !analysisResult.error) {
      return NextResponse.json(
        { error: 'No test data could be extracted. Ensure the image/PDF is a clear blood report with readable text.' },
        { status: 400 }
      );
    }

    // ===== Save to Database =====
    let reportId: string | null = null;
    try {
      const token = req.cookies.get('token')?.value;

      if (token) {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
        const userId = decoded.id;

        const report = new Report({
          userId,
          reportType: 'BLOOD_ANALYSIS',
          fileName: file.name,
          fileSize: file.size,
          reportData: analysisResult as Record<string, unknown>,
        });

        await report.save();
        reportId = report._id.toString();
        console.log('Blood report saved to database:', reportId);
      } else {
        console.log('No auth token - report not saved to database');
      }
    } catch (saveError) {
      console.error('⚠️ Failed to save report (non-fatal):', saveError);
      // Continue execution - database save is not critical
    }

    // ===== Return Success Response =====
    return NextResponse.json({
      success: true,
      data: analysisResult,
      reportId,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date().toISOString(),
        model: 'gemini-3-flash-preview',
        processingMode: isTextMode ? 'text-extraction' : 'vision-analysis',
        sdkVersion: '@google/genai',
        pdfParser: 'pdf-parse'
      },
    });

  } catch (error: unknown) {
    console.error('❌ Blood analyzer error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Handle specific API errors
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Invalid or missing API key',
          details: 'Please check your GEMINI_API_KEY environment variable',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'API quota exceeded',
          details: 'Rate limit reached. Please try again later.',
          timestamp: new Date().toISOString()
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error during analysis',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}