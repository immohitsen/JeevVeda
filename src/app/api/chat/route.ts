import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { 
  ChatRequestSchema,
  ExtractedDataSchema,
  getMissingFields,
  validatePartialHealthData
} from '@/lib/types';

// Use a dummy API key ONLY for local testing if the environment variable is not set
const apiKey = process.env.GEMINI_API_KEY || 'dummy_api_key_for_testing';
console.log(`Using API key: ${apiKey === 'dummy_api_key_for_testing' ? 'DUMMY KEY (fallback mode)' : 'Valid Key'}`);
const genAI = new GoogleGenAI({ apiKey });

// Simplified required fields for a better user experience
const requiredFields = [
  'age', 'gender', 'height_weight', 'smoking_status', 'alcohol_consumption', 
  'diet_habits', 'physical_activity', 'family_cancer_history', 'symptom_bowel_bladder', 
  'symptom_sore', 'symptom_bleeding', 'symptom_lump', 'symptom_swallowing', 
  'symptom_mole_change', 'symptom_cough'
];

// Friendly question templates
const questionTemplates: Record<string, string> = {
  age: "Could you share your age, please?",
  gender: "And how do you identify your gender?",
  height_weight: "Thanks! What’s your height and weight?",
  smoking_status: "Do you currently smoke, or have you smoked in the past?",
  alcohol_consumption: "What about alcohol? Do you drink, and how often?",
  diet_habits: "Could you tell me a little about your diet habits?",
  physical_activity: "How active are you physically – do you exercise regularly?",
  family_cancer_history: "Has anyone in your family had cancer?",
  symptom_bowel_bladder: "Have you noticed any recent changes in your bowel or bladder habits?",
  symptom_sore: "Do you have any sores that are not healing?",
  symptom_bleeding: "Have you experienced any unusual bleeding?",
  symptom_lump: "Have you felt any lumps in your body?",
  symptom_swallowing: "Do you face difficulty swallowing?",
  symptom_mole_change: "Have you noticed any change in a mole or skin spot?",
  symptom_cough: "Do you have a persistent cough or hoarseness?",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedRequest = ChatRequestSchema.parse(body);
    
    const { history, userResponses } = validatedRequest;
    const validatedResponses = validatePartialHealthData(userResponses);
    
    if (!validatedResponses) {
      return NextResponse.json({ error: 'Invalid user response data format' }, { status: 400 });
    }

    const collectedFields = Object.keys(validatedResponses);

    // Figure out missing fields so far
    const missingFields = getMissingFields(requiredFields, collectedFields);

    if (missingFields.length === 0 && collectedFields.length > 0) {
      return NextResponse.json({
        reply: "Thank you for providing all the information 🙏. I now have everything I need to prepare your assessment.",
        extractedData: {},
        isComplete: true,
      });
    }

    const nextQuestionKey = missingFields[0];

    // Fallback mock mode
    if (apiKey === 'dummy_api_key_for_testing') {
      const lastUserMessage = history[history.length - 1]?.content || "";
      return createMockAIResponse(nextQuestionKey, lastUserMessage);
    }

    const systemPrompt = `
      You are Dr. Priya, a friendly and empathetic health companion for users in India. 
      Your role is to collect health information in a natural conversation.

      TASK:
      1. From the user's last message, EXTRACT answers for ANY of these fields if they appear:
         ${requiredFields.join(", ")}.
      2. If a field is not clearly answered, do not include it in extractedData.
      3. Then ASK the next missing field question in a conversational, supportive way.

      RULES:
      - Keep the question short and human, not robotic.
      - Use simple language (avoid medical jargon).
      - Support both metric and imperial units.
      - You MUST output ONLY valid JSON. No markdown, no explanations, no text before or after the JSON.
      - Do NOT wrap your response in code blocks or backticks.
      - Your entire response must be parseable as a single JSON object.

      CRITICAL: Your response MUST be in this EXACT JSON format and nothing else:
      {
        "reply": "Next natural question about the next missing field",
        "extractedData": {
          "field1": "value",
          "field2": "value"
        }
      }
    `;
    
    // Convert the user's chat history to the format Gemini requires
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Prepend the system prompt to the chat history
    const fullContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...geminiHistory
    ];

    // Generate content with the model directly
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullContents,
    });
    
    const aiResponseText = result.text || '{}';
    
    // Clean the response text to ensure it's valid JSON
    let cleanedResponse = aiResponseText.trim();
    // Remove markdown code block markers if present
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }
    
    console.log("Cleaned AI response:", cleanedResponse);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", aiResponseText);
      
      // Fallback to a simple response
      return NextResponse.json({
        reply: "I'm having trouble understanding my own thoughts right now. Let's try again. Could you please repeat your last question?",
        extractedData: {},
        isComplete: false
      });
    }

    // Validate and normalize extracted data
    const extractedData = parsedResponse.extractedData || {};
    const normalizedData = normalizeHealthData(extractedData);

    // Merge with already collected responses
    const updatedResponses = { ...validatedResponses, ...normalizedData };

    // Find missing fields after merge
    const updatedMissing = getMissingFields(requiredFields, Object.keys(updatedResponses));

    let nextQuestion = "";
    if (updatedMissing.length > 0) {
      nextQuestion = questionTemplates[updatedMissing[0]] 
        || `Could you share your ${updatedMissing[0].replace(/_/g, " ")}?`;
    }

    const finalResponse = {
      reply: nextQuestion || "Thanks, I have all the details I need 🙏",
      extractedData: normalizedData,
      isComplete: updatedMissing.length === 0,
    };

    // Validate JSON shape with zod schema
    ExtractedDataSchema.parse(finalResponse);

    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Handle different error types
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid request data format', details: error.issues }, { status: 400 });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('JSON parsing error:', error.message);
      return NextResponse.json({ 
        reply: "I received an invalid response format. Let's try again with a simpler question.",
        extractedData: {},
        isComplete: false
      }, { status: 500 });
    }
    
    // Handle network or API errors
    if (error instanceof Error) {
      console.error(`API Error: ${error.name}: ${error.message}`);
      
      // If using dummy key, switch to mock mode
      if (apiKey === 'dummy_api_key_for_testing') {
        console.log('Switching to mock mode due to error with dummy key');
        // Default to asking about age if we can't determine the next field
        const nextField = 'age';
        const lastMsg = Array.isArray(history) && history.length > 0 ? 
          history[history.length - 1]?.content || "" : "";
        return createMockAIResponse(nextField, lastMsg);
      }
    }
    
    // Generic fallback
    return NextResponse.json({ 
      reply: "I'm sorry, I'm having a little trouble connecting right now. Could you please try again?",
      extractedData: {},
      isComplete: false
    }, { status: 500 });
  }
}

/**
 * Normalize user inputs for consistency
 */
function normalizeHealthData(data: Record<string, string>) {
  const normalized: Record<string, string> = {};

  if (data.height_weight) {
    normalized.height_weight = data.height_weight
      .replace(/feet|ft/gi, "'")
      .replace(/inches|inch|in/gi, '"')
      .replace(/kgs?|kilograms?/gi, 'kg')
      .replace(/lbs?|pounds?/gi, 'lb');
  }

  if (data.smoking_status) {
    const msg = data.smoking_status.toLowerCase();
    if (msg.includes("never")) normalized.smoking_status = "non-smoker";
    else if (msg.includes("quit") || msg.includes("former")) normalized.smoking_status = "former smoker";
    else if (msg.includes("yes") || msg.includes("current")) normalized.smoking_status = "current smoker";
  }

  return { ...data, ...normalized };
}

/**
 * Creates a mock AI response for local development when no API key is available.
 */
function createMockAIResponse(nextField: string, userMessage: string) {
  console.log(`👨‍💻 Using Mock AI Response. Next question is about: "${nextField}"`);
  
  const defaultQuestions: Record<string, string> = {
    gender: "Thanks! And what is your gender?",
    height_weight: "Got it. Could you share your height and weight?",
    smoking_status: "Okay. What about smoking – are you a current, former, or non-smoker?",
    default: `Thanks for that. Now, could you tell me about your ${nextField.replace(/_/g, " ")}?`
  };

  const reply = defaultQuestions[nextField] || defaultQuestions.default;

  return NextResponse.json({
    reply,
    extractedData: { message: userMessage }, 
    isComplete: false
  });
}
