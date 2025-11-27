// src/app/api/blood-analyzer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createRequire } from 'module';
import Tesseract from 'tesseract.js';
import { GoogleGenAI } from '@google/genai';
import { connect } from '@/dbConfig/dbConfig';
import Report from '@/models/reportModel';
import jwt from 'jsonwebtoken';

// ✅ Run on Node (pdf-parse & canvas need Node APIs)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ---- AI client (@google/genai) ----
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

// Connect to database
connect();


// Clean extracted text a bit but keep medical formatting
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\w\s.,()[\]/\-:<>%*\n]/g, '') // keep * (often marks flags)
    .replace(/\s{3,}/g, ' ')
    .trim();
}

// Heuristic: does this look like a lab report?
function validateMedicalText(text: string): boolean {
  const lower = text.toLowerCase();
  const keys = [
    'patient','report','test','result','blood','lab','laboratory','haemoglobin','hemoglobin',
    'wbc','rbc','hgb','hct','mcv','mch','platelet','lymphocyte','neutrophil','range','reference'
  ];
  const found = keys.filter(k => lower.includes(k)).length;
  const hasUnits = /\d+\.?\d*\s*(mg\/dl|g\/dl|mmol\/l|u\/l|iu\/l|%|cells|count|fL|pg)/i.test(text);
  return found >= 2 || hasUnits;
}

// ---------- OCR (Images) ----------
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR ${(m.progress * 100).toFixed(1)}%`);
      }
    },
  });

  const text = (data.text || '').trim();
  // Don’t fail on confidence alone; check if anything meaningful was read
  if (text.length < 30) {
    throw new Error('Very little text recognized from the image. Please upload a clearer image.');
  }
  return text;
}

// ---------- PDF (text-based) via pdf-parse ----------
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  if (!pdfBuffer?.length) throw new Error('Invalid PDF buffer');
  const header = pdfBuffer.subarray(0, 4).toString();
  if (!header.includes('%PDF')) throw new Error('File does not appear to be a valid PDF');

  try {
    const require = createRequire(import.meta.url);
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(pdfBuffer);
    const text = data.text?.trim() || '';
    
    if (text.length < 5) throw new Error('Failed to extract text from PDF (possibly image-only).');
    return text;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('PDF engine unavailable on server');
  }
}


// ---------- Route ----------
export async function POST(req: NextRequest) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
          { error: 'Gemini API key missing. Set GEMINI_API_KEY in your environment.' },
          { status: 500 }
        );
      }
  
      const formData = await req.formData();
      const fileAny = formData.get('file');
  
      // ✅ Ensure we actually got a Browser File object, not a string/path
      if (!fileAny || typeof (fileAny as File).arrayBuffer !== 'function') {
        return NextResponse.json(
          { error: 'No valid file uploaded. Please select a file from your device.' },
          { status: 400 }
        );
      }
  
      const file = fileAny as File;
  
      // Log for debugging (safe)
      console.log('Upload:', { name: file.name, type: file.type, size: file.size });
  
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and PDF are supported.' }, { status: 400 });
      }
  
      const maxSize = file.type === 'application/pdf' ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
      if (!file.size || file.size > maxSize) {
        return NextResponse.json(
          { error: `File size must be under ${file.type === 'application/pdf' ? '15MB' : '10MB'}.` },
          { status: 400 }
        );
      }
  
      const fileBuffer = Buffer.from(await file.arrayBuffer());

    // --- Extract text ---
    let extractedText = '';
    if (file.type === 'application/pdf') {
      try {
        extractedText = await extractTextFromPDF(fileBuffer);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('ENOENT')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Could not read a local file path. Please upload a file from the browser (not a path).',
              details: 'Click "Select File" and choose your report (PDF/JPG/PNG).',
            },
            { status: 400 }
          );
        }
        throw error;
      }
    } else {
      extractedText = await extractTextFromImage(fileBuffer);
    }

    const cleaned = cleanText(extractedText);
    if (cleaned.length < 20 || !validateMedicalText(cleaned)) {
      return NextResponse.json({
        error: 'The uploaded file does not appear to contain a readable blood report. Please upload a clearer image or a text-based PDF.',
      }, { status: 400 });
    }

    // --- AI analysis (force JSON response) ---
    const prompt = `
Analyze this blood test report and return ONLY valid JSON. No markdown, no explanations, just JSON.

Blood Test Report:
${cleaned}

Return this exact JSON structure:
{
  "patientInfo": { "name": null, "age": null, "gender": null, "reportDate": null },
  "testResults": [{ "category": "Complete Blood Count", "tests": [{ "testName": "Hemoglobin", "value": "12.5", "unit": "g/dL", "referenceRange": "12.0-15.5", "status": "normal" }] }],
  "cancerRiskAssessment": {
    "overallRisk": "low",
    "riskFactors": [{ "factor": "Age", "value": "Unknown", "significance": "Cannot assess", "riskLevel": "low" }],
    "cancerTypes": [{ "type": "General", "riskLevel": "low", "indicators": [] }],
    "recommendations": ["Regular health checkups recommended"]
  },
  "otherHealthRisks": [{ "condition": "General Health", "risk": "low", "indicators": [], "description": "Based on available blood work" }],
  "insights": ["Blood parameters appear within normal ranges"],
  "overallAssessment": "Blood work shows normal values"
}`;

    const ai = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = ai.text || '';
    let analysisResult: Record<string, unknown>;
    try {
      // Try to extract JSON if it's wrapped in markdown or other text
      let jsonText = responseText;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      analysisResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI Response:', responseText);
      
      // Return a fallback response
      analysisResult = {
        patientInfo: { name: null, age: null, gender: null, reportDate: null },
        testResults: [{ 
          category: "Unable to Parse", 
          tests: [{ 
            testName: "Error", 
            value: "Could not extract data", 
            unit: "", 
            referenceRange: "", 
            status: "unknown" 
          }] 
        }],
        cancerRiskAssessment: {
          overallRisk: "unable_to_determine",
          riskFactors: [],
          cancerTypes: [],
          recommendations: ["Please upload a clearer report"]
        },
        otherHealthRisks: [],
        insights: ["Unable to process report format"],
        overallAssessment: "Please try uploading a clearer or different format of your blood report"
      };
    }

    if (!analysisResult?.testResults || (Array.isArray(analysisResult.testResults) && analysisResult.testResults.length === 0)) {
      return NextResponse.json(
        { error: 'No test data could be extracted from the report.' },
        { status: 400 }
      );
    }

    // Save report to database
    let reportId = null;
    try {
      // Get userId from token
      const token = req.cookies.get("token")?.value;
      if (token) {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
        const userId = decoded.id;

        // Save report
        const report = new Report({
          userId,
          reportType: 'BLOOD_ANALYSIS',
          fileName: file.name,
          fileSize: file.size,
          reportData: analysisResult
        });

        await report.save();
        reportId = report._id.toString();
        console.log('Blood report saved:', reportId);
      }
    } catch (saveError) {
      console.error('Failed to save report:', saveError);
      // Continue anyway - don't fail the analysis
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
      reportId,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date().toISOString(),
        extractedTextLength: cleaned.length,
        ocrMethod: file.type === 'application/pdf' ? 'pdf-parse|ocr-fallback' : 'tesseract-ocr',
      },
    });
  } catch (error: unknown) {
    console.error('Blood analyzer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process the file',
        details: 'Upload a clear image or a selectable-text PDF of your blood report.',
      },
      { status: 500 }
    );
  }
}
