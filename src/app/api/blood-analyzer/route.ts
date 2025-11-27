// src/app/api/blood-analyzer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { connect } from '@/dbConfig/dbConfig';
import Report from '@/models/reportModel';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ---- AI client (@google/genai) ----
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

// Connect to database
connect();

// --- Build prompt for Gemini 3 (extraction + analysis + JSON) ---
function buildPrompt() {
  return `
You are a careful medical-report parser.

You are given a blood test report as a FILE (image or PDF). 

Your job:

1. Internally extract all readable text from the file (blood report).
2. From that text, identify:
   - Patient details (if present)
   - All blood test results
   - Any indicators of cancer risk or other health risks
3. Return ONLY a single JSON object with this exact structure and keys:

{
  "patientInfo": { "name": null, "age": null, "gender": null, "reportDate": null },
  "testResults": [
    {
      "category": "Complete Blood Count",
      "tests": [
        {
          "testName": "Hemoglobin",
          "value": "12.5",
          "unit": "g/dL",
          "referenceRange": "12.0-15.5",
          "status": "normal"
        }
      ]
    }
  ],
  "cancerRiskAssessment": {
    "overallRisk": "low",
    "riskFactors": [
      {
        "factor": "Age",
        "value": "Unknown",
        "significance": "Cannot assess",
        "riskLevel": "low"
      }
    ],
    "cancerTypes": [
      {
        "type": "General",
        "riskLevel": "low",
        "indicators": []
      }
    ],
    "recommendations": ["Regular health checkups recommended"]
  },
  "otherHealthRisks": [
    {
      "condition": "General Health",
      "risk": "low",
      "indicators": [],
      "description": "Based on available blood work"
    }
  ],
  "insights": ["Blood parameters appear within normal ranges"],
  "overallAssessment": "Blood work shows normal values"
}

Important rules:
- Use the actual values from the report wherever possible.
- If a value is missing in the report, use null or "Unknown" where appropriate.
- Do NOT invent tests or values that are not present.
- "status" should be "low", "high", "normal", or "unknown" based on reference ranges if they are given.
- If you cannot read the report or it is not a blood report, then return this fallback JSON:

{
  "patientInfo": { "name": null, "age": null, "gender": null, "reportDate": null },
  "testResults": [
    {
      "category": "Unable to Parse",
      "tests": [
        {
          "testName": "Error",
          "value": "Could not extract data",
          "unit": "",
          "referenceRange": "",
          "status": "unknown"
        }
      ]
    }
  ],
  "cancerRiskAssessment": {
    "overallRisk": "unable_to_determine",
    "riskFactors": [],
    "cancerTypes": [],
    "recommendations": ["Please upload a clearer report"]
  },
  "otherHealthRisks": [],
  "insights": ["Unable to process report format"],
  "overallAssessment": "Please try uploading a clearer or different format of your blood report"
}

Return ONLY the JSON object. No markdown, no commentary, no extra text.
`;
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

    if (!fileAny || typeof (fileAny as File).arrayBuffer !== 'function') {
      return NextResponse.json(
        { error: 'No valid file uploaded. Please select a file from your device.' },
        { status: 400 }
      );
    }

    const file = fileAny as File;
    console.log('Upload:', { name: file.name, type: file.type, size: file.size });

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF are supported.' },
        { status: 400 }
      );
    }

    const maxSize = file.type === 'application/pdf' ? 30 * 1024 * 1024 : 15 * 1024 * 1024;
    if (!file.size || file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be under ${file.type === 'application/pdf' ? '30MB' : '15MB'}.` },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Data = fileBuffer.toString('base64');

    const prompt = buildPrompt();

    // ---- Gemini 3 Pro call with inline file ----
    const ai = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        temperature: 0.0,
        maxOutputTokens: 1500,
        topK: 1,
      },
    });

    // Try to get text from different possible shapes
    const aiResponse = ai as unknown as {
      text?: string;
      outputText?: string;
      response?: {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };
    };

    const responseText =
      aiResponse.text ||
      aiResponse.outputText ||
      aiResponse.response?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n') ||
      '';

    let analysisResult: Record<string, unknown>;

    try {
      let jsonText = String(responseText);
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonText = jsonMatch[0];
      analysisResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('AI Response (raw):', responseText);

      // Fallback JSON if Gemini does something stupid
      analysisResult = {
        patientInfo: { name: null, age: null, gender: null, reportDate: null },
        testResults: [
          {
            category: 'Unable to Parse',
            tests: [
              {
                testName: 'Error',
                value: 'Could not extract data',
                unit: '',
                referenceRange: '',
                status: 'unknown',
              },
            ],
          },
        ],
        cancerRiskAssessment: {
          overallRisk: 'unable_to_determine',
          riskFactors: [],
          cancerTypes: [],
          recommendations: ['Please upload a clearer report'],
        },
        otherHealthRisks: [],
        insights: ['Unable to process report format'],
        overallAssessment: 'Please try uploading a clearer or different format of your blood report',
      };
    }

    if (
      !analysisResult?.testResults ||
      (Array.isArray(analysisResult.testResults) && analysisResult.testResults.length === 0)
    ) {
      return NextResponse.json(
        { error: 'No test data could be extracted from the report.' },
        { status: 400 }
      );
    }

    // Save report to database (if user logged in)
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
          reportData: analysisResult,
        });

        await report.save();
        reportId = report._id.toString();
        console.log('Blood report saved:', reportId);
      }
    } catch (saveError) {
      console.error('Failed to save report:', saveError);
      // don't fail the whole request just because save failed
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
        ocrMethod: 'gemini-3-pro-inline',
      },
    });
  } catch (error: unknown) {
    console.error('Blood analyzer API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process the file',
        details:
          'Make sure GEMINI_API_KEY is set and that your @google/genai version supports inlineData for files.',
      },
      { status: 500 }
    );
  }
}
