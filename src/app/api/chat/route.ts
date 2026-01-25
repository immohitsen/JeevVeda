import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema, getMissingFields } from "@/lib/types";
import { connect } from '@/dbConfig/dbConfig';
import Report from '@/models/reportModel';
import jwt from 'jsonwebtoken';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Initialize DB connection
connect();

// Simplified required fields for a better user experience
const requiredFields = [
  'age',
  'gender',
  'height_weight',
  'smoking_status',
  'alcohol_consumption',
  'diet_habits',
  'physical_activity',
  'family_cancer_history',
  'symptom_digestive_swallowing',
  'symptom_bleeding_cough',
  'symptom_skin_lumps'
];

const QUESTION_MAP: Record<string, string> = {
  age: "To help me get to know you, could you please start by telling me your age?",
  gender: "Thank you. What describes your gender?",
  height_weight: "Could you share your height and weight? (e.g., 5'6\" 70kg)",
  smoking_status: "Do you smoke or use tobacco products? (e.g., cigarettes, gutka, paan)",
  alcohol_consumption: "How often do you consume alcohol?",
  diet_habits: "How would you describe your typical diet? (e.g., Vegetarian, Non-veg, Home-cooked, Spicy)",
  physical_activity: "How often do you exercise or engage in physical activity?",
  family_cancer_history: "Does your family have any history of cancer? If yes, please specify.",
  symptom_digestive_swallowing: "Have you noticed any persistent changes in bowel/bladder habits or difficulty swallowing?",
  symptom_bleeding_cough: "Do you have any unusual bleeding, discharge, or a persistent cough?",
  symptom_skin_lumps: "Have you noticed any new lumps, sores that won't heal, or changes in moles/warts?",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedRequest = ChatRequestSchema.parse(body);
    const { history, userResponses } = validatedRequest;

    // Use passed userResponses, or empty object if first time
    const currentData = { ...userResponses };
    const lastUserMessage = history.length > 0 && history[history.length - 1].role === 'user'
      ? history[history.length - 1].content
      : null;

    // 1. Check what we are missing BEFORE processing the new message
    // (This tells us what question the user is answering)
    let missingFields = getMissingFields(requiredFields, Object.keys(currentData));

    // 2. Process the new message if it exists
    if (lastUserMessage) {
      if (Object.keys(currentData).length === 0) {
        // SPECIAL CASE: First question is always Age.
        // Validate if it looks like an age (simple heuristic: contains a number)
        if (/\d+/.test(lastUserMessage)) {
          // It's likely an age, save it
          currentData['age'] = lastUserMessage;
        } else {
          // User said "Hi" or something irrelevant. Ignore it.
          // We will stick to asking for Age.
        }
      } else if (missingFields.length > 0) {
        // The user is answering the FIRST missing field (which we asked previously)
        const fieldBeingAnswered = missingFields[0];
        currentData[fieldBeingAnswered] = lastUserMessage;
      }
    }

    // 3. Re-calculate missing fields after update
    missingFields = getMissingFields(requiredFields, Object.keys(currentData));

    // 4. If we still have missing fields, return the next question (LOCAL)
    if (missingFields.length > 0) {
      const nextField = missingFields[0];
      const nextQuestion = QUESTION_MAP[nextField];

      return NextResponse.json({
        reply: nextQuestion,
        extractedData: currentData,
        isComplete: false
      });
    }

    // 5. If ALL fields are present, GENERATE REPORT (LLM)
    // Now we use the LLM only once at the end.

    // Construct a comprehensive prompt
    const systemPrompt = `
You are Dr. Priya, a professional AI health assistant.
The user has provided their health details through a chat conversation. 
Your task is TWO-FOLD:
1. EXTRACT and CLEAN the data into a strict JSON format. Convert conversational answers (e.g., "I am 25 years old") into clean values (e.g., "25").
2. ANALYZE this data and provide a personalized health assessment report.

RAW USER DATA:
${JSON.stringify(currentData, null, 2)}

REQUIRED JSON OUTPUT FORMAT:
{
  "cleaned_data": {
    "age": "number only (e.g. '25')",
    "gender": "Male/Female/Other",
    "height_weight": "Standardized string (e.g. '5ft 10in, 75kg')",
    "smoking_status": "e.g. 'Never', 'Former', 'Current'",
    "alcohol_consumption": "Frequency",
    "diet_habits": "Summary",
    "physical_activity": "Summary",
    "family_cancer_history": "Yes/No and details",
    "symptom_digestive_swallowing": "Details or 'None'",
    "symptom_bleeding_cough": "Details or 'None'",
    "symptom_skin_lumps": "Details or 'None'"
  },
  "assessment_report": "YOUR COMPREHENSIVE REPORT HERE. Start with a Title. Use Markdown formatting (bold key terms). Highlight risk factors. Provide actionable recommendations. Tone: Professional & Empathetic."
}

IMPORTANT:
- The output MUST be valid JSON.
- Do not include any text outside the JSON block.
- For "cleaned_data", ensure values are concise and standardized.
- **Do NOT use HTML tags (like <strong>, <br>). Use standard Markdown only.**
`;

    // We can use a simpler model or the same flash model
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      config: {
        temperature: 0.1, // Low temperature for consistent formatting
        responseMimeType: "application/json" // Force JSON output
      }
    });

    const responseText = result.text || '{}';
    let finalOutput;

    try {
      finalOutput = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse LLM JSON response:", responseText);
      // Fallback if JSON parsing fails - use raw text as report and original data
      finalOutput = {
        cleaned_data: currentData,
        assessment_report: responseText
      };
    }

    const { cleaned_data, assessment_report } = finalOutput;

    // Use cleaned_data for DB and Frontend
    const dataToSave = cleaned_data || currentData;
    const reportText = assessment_report || "Report generation failed. Please try again.";

    // Save report to database if possible
    try {
      const token = req.cookies.get("token")?.value;
      if (token) {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as { id: string };
        const userId = decoded.id;

        const newReport = new Report({
          userId: userId,
          reportType: 'RISK_ASSESSMENT',
          reportData: {
            collectedData: dataToSave,
            assessment: reportText,
          }
        });

        await newReport.save();
        console.log("Cancer assessment report saved to DB");
      } else {
        console.warn("No auth token found - report NOT saved to DB");
      }
    } catch (dbError) {
      console.error("Failed to save report to DB:", dbError);
      // Continue to return response even if save fails
    }

    const finalResponse = {
      reply: "Thank you for sharing your details. I have prepared your personalized health assessment report. Please click the 'Report' tab to view it.",
      extractedData: {
        ...dataToSave,
        assessment_report: reportText
      },
      isComplete: true,
    };

    return NextResponse.json(finalResponse);

  } catch (error: unknown) {
    // ... existing error handling ...
    // Extract specific API error message if available (e.g. for 429 Quota Exceeded)
    // Structure: { error: { code, message, status } }

    // Type assertion for error handling
    const err = error as { error?: { message?: string }, message?: string };

    let errorMessage = err?.error?.message || err?.message || "I'm having a little trouble connecting to my brain right now.";

    // Attempt to extract cleaner message if the error message is stringified JSON
    try {
      if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch {
      // Failed to parse, stick with the original message
    }

    console.error('Chat API Error Details:', error);

    return NextResponse.json({
      reply: errorMessage,
      extractedData: {},
      isComplete: false
    });
  }
}