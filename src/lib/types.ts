import { z } from 'zod';

// Zod schema for user health data
export const UserHealthDataSchema = z.object({
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  height_weight: z.string().optional().describe("Height and weight in any format (e.g., '5'6\" 140 lbs', '170 cm 64 kg', '5 feet 6 inches 140 pounds')"),
  
  // Enhanced lifestyle factors for Indian context
  smoking_status: z.string().min(1, "Smoking status is required"),
  smoking_details: z.string().optional(),
  smoking_duration: z.string().optional(), // How long they smoked
  smoking_frequency: z.string().optional(), // Cigarettes per day
  
  alcohol_consumption: z.string().min(1, "Alcohol consumption is required"),
  alcohol_frequency: z.string().optional(), // How often they drink
  
  // Indian diet and lifestyle
  diet_habits: z.string().min(1, "Diet habits are required"),
  vegetarian_status: z.string().optional(), // Vegetarian/Non-vegetarian
  processed_food_consumption: z.string().optional(), // Packaged/processed foods
  spice_consumption: z.string().optional(), // Spicy food habits
  
  physical_activity: z.string().min(1, "Physical activity is required"),
  exercise_frequency: z.string().optional(), // Times per week
  sedentary_lifestyle: z.string().optional(), // Desk job, sitting hours
  
  sun_exposure: z.string().min(1, "Sun exposure is required"),
  outdoor_work: z.string().optional(), // Outdoor job or activities
  
  // Enhanced medical history
  personal_cancer_history: z.string().min(1, "Personal cancer history is required"),
  cancer_type: z.string().optional(), // If yes, what type
  cancer_treatment: z.string().optional(), // Surgery, chemo, radiation
  
  chronic_conditions: z.string().min(1, "Chronic conditions are required"),
  diabetes: z.string().optional(), // Diabetes status
  hypertension: z.string().optional(), // Blood pressure
  obesity: z.string().optional(), // BMI or weight issues
  
  radiation_exposure: z.string().min(1, "Radiation exposure is required"),
  xray_frequency: z.string().optional(), // Recent X-rays, CT scans
  
  // Family history with details
  family_cancer_history: z.string().min(1, "Family cancer history is required"),
  family_cancer_details: z.string().optional(),
  family_cancer_types: z.string().optional(), // Types of cancer in family
  family_cancer_ages: z.string().optional(), // Ages when diagnosed
  
  // Enhanced symptom screening
  symptom_bowel_bladder: z.string().min(1, "Bowel/bladder symptoms are required"),
  symptom_sore: z.string().min(1, "Sore symptoms are required"),
  symptom_bleeding: z.string().min(1, "Bleeding symptoms are required"),
  symptom_lump: z.string().min(1, "Lump symptoms are required"),
  symptom_swallowing: z.string().min(1, "Swallowing symptoms are required"),
  symptom_mole_change: z.string().min(1, "Mole change symptoms are required"),
  symptom_cough: z.string().min(1, "Cough symptoms are required"),
  
  // Additional Indian-specific factors
  tobacco_chewing: z.string().optional(), // Gutka, paan, khaini
  betel_nut_consumption: z.string().optional(), // Areca nut
  occupational_hazards: z.string().optional(), // Chemical exposure, pollution
  water_source: z.string().optional(), // Drinking water quality
  air_pollution_exposure: z.string().optional(), // Living in polluted areas
  stress_levels: z.string().optional(), // Work/life stress
  sleep_patterns: z.string().optional(), // Sleep quality and duration
});

// Schema for extracted data from AI response
export const ExtractedDataSchema = z.object({
  reply: z.string().min(1, "Reply is required"),
  extractedData: z.record(z.string(), z.string()),
});

// Schema for the complete API response
export const ChatResponseSchema = z.object({
  reply: z.string().min(1, "Reply is required"),
  extractedData: z.record(z.string(), z.string()),
  isComplete: z.boolean(),
});

// Schema for the request body
export const ChatRequestSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  userResponses: z.record(z.string(), z.string()),
});

// Type exports
export type UserHealthData = z.infer<typeof UserHealthDataSchema>;
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Helper function to validate partial health data
export const validatePartialHealthData = (data: Record<string, unknown>) => {
  try {
    // Create a partial schema that only requires the fields that are present
    const partialSchema = UserHealthDataSchema.partial();
    return partialSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
    }
    return null;
  }
};

// Helper function to get missing fields
export const getMissingFields = (
  requiredFields: string[], 
  collectedFields: string[]
): string[] => {
  return requiredFields.filter(field => !collectedFields.includes(field));
};

// Helper function to find the field being answered
export const findFieldBeingAnswered = (
  lastBotQuestion: string, 
  requiredFields: string[]
): string => {
  const lowerQuestion = lastBotQuestion.toLowerCase();
  
  // Map question keywords to field names
  const fieldKeywords: Record<string, string[]> = {
    age: ['age', 'old', 'years old'],
    gender: ['gender', 'male', 'female', 'sex'],
    height_weight: ['height', 'weight', 'tall', 'weigh', 'cm', 'kg', 'feet', 'lbs'],
    smoking_status: ['smoke', 'smoking', 'cigarette', 'tobacco'],
    alcohol_consumption: ['alcohol', 'drink', 'drinking', 'beer', 'wine'],
    diet_habits: ['diet', 'eat', 'food', 'eating', 'vegetarian'],
    physical_activity: ['activity', 'exercise', 'workout', 'active', 'physical'],
    family_cancer_history: ['family', 'relatives', 'parents', 'siblings', 'cancer history'],
    symptom_bowel_bladder: ['bowel', 'bladder', 'urination', 'bathroom'],
    symptom_sore: ['sore', 'wound', 'heal'],
    symptom_bleeding: ['bleeding', 'blood'],
    symptom_lump: ['lump', 'bump', 'mass'],
    symptom_swallowing: ['swallowing', 'swallow', 'throat'],
    symptom_mole_change: ['mole', 'skin', 'spot', 'mark'],
    symptom_cough: ['cough', 'coughing']
  };
  
  // Check for keyword matches
  for (const field of requiredFields) {
    const keywords = fieldKeywords[field] || [field.replace(/_/g, " ")];
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      return field;
    }
  }
  
  return 'age'; // Default to age for the first message
};

// Utility function to parse height and weight from various formats
export const parseHeightWeight = (input: string): { height?: string; weight?: string; unit?: string } => {
  const result: { height?: string; weight?: string; unit?: string } = {};
  
  // Common patterns for Indian users
  const patterns = [
    // Metric: "170 cm 64 kg" or "170cm 64kg"
    /(\d+)\s*cm.*?(\d+)\s*kg/i,
    // Imperial: "5'6\" 140 lbs" or "5 feet 6 inches 140 pounds"
    /(\d+)'(\d+)"?\s*(\d+)\s*(lbs?|pounds?)/i,
    // Feet and inches with words: "5 feet 6 inches 140 pounds"
    /(\d+)\s*feet?\s*(\d+)\s*inches?\s*(\d+)\s*(lbs?|pounds?)/i,
    // Mixed: "170 cm 140 lbs" or "5'6\" 64 kg"
    /(\d+)\s*cm.*?(\d+)\s*(lbs?|pounds?)/i,
    /(\d+)'(\d+)"?\s*(\d+)\s*kg/i,
    // Simple numbers (assume metric for Indian context)
    /(\d+)\s+(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      if (pattern.source.includes('cm')) {
        // Metric format
        result.height = `${match[1]} cm`;
        result.weight = `${match[2]} kg`;
        result.unit = 'metric';
      } else if (pattern.source.includes("'")) {
        // Imperial format
        result.height = `${match[1]}'${match[2]}"`;
        result.weight = `${match[3]} ${match[4]}`;
        result.unit = 'imperial';
      } else if (pattern.source.includes('feet')) {
        // Feet and inches format
        result.height = `${match[1]}'${match[2]}"`;
        result.weight = `${match[3]} ${match[4]}`;
        result.unit = 'imperial';
      } else if (pattern.source.includes('kg')) {
        // Weight in kg, height might be in cm
        result.weight = `${match[2]} kg`;
        result.height = `${match[1]} cm`;
        result.unit = 'metric';
      } else if (pattern.source.includes('lbs') || pattern.source.includes('pounds')) {
        // Weight in lbs, height might be in feet/inches
        result.weight = `${match[2]} lbs`;
        result.height = `${match[1]} cm`; // Assume metric height for Indian context
        result.unit = 'mixed';
      } else {
        // Simple numbers - assume metric for Indian context
        result.height = `${match[1]} cm`;
        result.weight = `${match[2]} kg`;
        result.unit = 'metric';
      }
      break;
    }
  }

  return result;
};

// Utility function to convert between units (optional)
export const convertUnits = {
  cmToFeet: (cm: number): string => {
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  },
  kgToLbs: (kg: number): number => {
    return Math.round(kg * 2.20462);
  },
  lbsToKg: (lbs: number): number => {
    return Math.round(lbs / 2.20462);
  }
};
