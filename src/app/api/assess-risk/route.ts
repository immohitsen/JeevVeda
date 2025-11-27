import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/dbConfig/dbConfig';
import Report from '@/models/reportModel';
import jwt from 'jsonwebtoken';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

connect();

interface RiskFactors {
  age: string;
  gender: string;
  height_weight: string;
  smoking_status: string;
  smoking_details: string;
  alcohol_consumption: string;
  diet_habits: string;
  physical_activity: string;
  sun_exposure: string;
  personal_cancer_history: string;
  chronic_conditions: string;
  radiation_exposure: string;
  family_cancer_history: string;
  family_cancer_details: string;
  symptom_bowel_bladder: string;
  symptom_sore: string;
  symptom_bleeding: string;
  symptom_lump: string;
  symptom_swallowing: string;
  symptom_mole_change: string;
  symptom_cough: string;
  [key: string]: string;
}

export async function POST(req: NextRequest) {
  try {
    const riskFactors: RiskFactors = await req.json();

    const patientProfile = Object.entries(riskFactors)
      .map(([key, value]) => `- ${key.replace(/_/g, " ")}: ${value}`)
      .join("\n");

    const assessmentPrompt = `
You are an expert medical risk assessment AI.
Analyze the patient data below for cancer risk.
Be cautious, evidence-based, and make it clear this is NOT medical advice.

Patient Profile:
${patientProfile}

Provide TWO outputs:
1. A short summary paragraph (readable for the user).
2. A clean JSON object with exactly this schema:
{
  "riskScore": number,
  "riskCategory": string,
  "keyRiskFactors": string[],
  "recommendations": string[],
  "screeningTimeline": string,
  "interpretation": string,
  "disclaimer": string
}
No markdown or extra text—only the JSON after the paragraph.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: assessmentPrompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // Correct way to get generated text
    // Correct way with null-check
    const fullText = result.text ?? "";
    if (!fullText) {
      console.error("AI returned no text:", result);
      throw new Error("Empty response from AI.");
    }
    console.log("AI returned:", fullText);

    const jsonMatch = fullText.match(/\{[\s\S]*\}$/);
    if (!jsonMatch) {
      console.error("AI Response has no JSON:", fullText);
      throw new Error("AI response missing JSON.");
    }

    const summary = fullText.slice(0, fullText.indexOf(jsonMatch[0])).trim();

    let assessment: Record<string, unknown>;
    try {
      assessment = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parsing error:", err);
      throw new Error("Invalid JSON from AI.");
    }

    // Save report to database
    let reportId = null;
    try {
      // Get userId from token
      const token = req.cookies.get("token")?.value;
      if (token) {
        const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
        const userId = decoded.id;

        // Save report
        const report = new Report({
          userId,
          reportType: 'RISK_ASSESSMENT',
          reportData: {
            collectedData: riskFactors,
            summary,
            assessment
          }
        });

        await report.save();
        reportId = report._id.toString();
        console.log('Risk assessment report saved:', reportId);
      }
    } catch (saveError) {
      console.error('Failed to save risk assessment:', saveError);
      // Continue anyway - don't fail the assessment
    }

    return NextResponse.json({
      success: true,
      summary,
      assessment,
      reportId,
    });
  } catch (err: unknown) {
    console.error("Error in risk assessment API:", err);
    return NextResponse.json(
      { success: false, error: "Could not complete risk assessment" },
      { status: 500 }
    );
  }
}
