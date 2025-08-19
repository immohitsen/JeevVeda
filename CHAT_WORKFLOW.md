# Chat Workflow and Zod Data Extraction

## Overview
This document explains the complete workflow of the health assessment chatbot and how Zod is used for robust data extraction and validation.

## Architecture Overview

```
User Input → Chat API → AI Processing → Zod Validation → Response
     ↓
Data Extraction → Risk Assessment → Results Display
```

## 1. Chat Flow

### 1.1 Initial State
- User starts with a welcome message
- System tracks conversation history and collected user responses
- Required fields are predefined in the system

### 1.2 Conversation Loop
1. **User sends message** → Added to conversation history
2. **API processes request** → Validates input using Zod schemas
3. **AI analyzes response** → Extracts relevant health information
4. **AI generates next question** → Asks for missing information
5. **Response validation** → Zod validates AI output structure
6. **Data extraction** → Validated data is stored in user responses
7. **Repeat** until all required fields are collected

### 1.3 Completion
- When all required fields are collected, assessment is triggered
- Risk calculation is performed using collected data
- Results are displayed in a structured format

## 2. Zod Implementation

### 2.1 Schema Definitions (`src/lib/types.ts`)

#### User Health Data Schema
```typescript
export const UserHealthDataSchema = z.object({
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  height_weight: z.string().optional(),
  smoking_status: z.string().min(1, "Smoking status is required"),
  // ... other fields
});
```

#### API Request/Response Schemas
```typescript
export const ChatRequestSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  userResponses: z.record(z.string(), z.string()),
});

export const ChatResponseSchema = z.object({
  reply: z.string().min(1, "Reply is required"),
  extractedData: z.record(z.string(), z.string()),
  isComplete: z.boolean(),
});
```

### 2.2 Validation Functions

#### Partial Data Validation
```typescript
export const validatePartialHealthData = (data: Record<string, any>) => {
  try {
    const partialSchema = UserHealthDataSchema.partial();
    return partialSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    }
    return null;
  }
};
```

#### Helper Functions
```typescript
export const getMissingFields = (
  requiredFields: string[], 
  collectedFields: string[]
): string[] => {
  return requiredFields.filter(field => !collectedFields.includes(field));
};

export const findFieldBeingAnswered = (
  lastBotQuestion: string, 
  requiredFields: string[]
): string => {
  // Logic to determine which field the user is answering
};
```

## 3. Data Flow

### 3.1 Request Processing
```typescript
// 1. Parse request body
const body = await req.json();

// 2. Validate request structure
const validatedRequest = ChatRequestSchema.parse(body);

// 3. Validate user responses
const validatedResponses = validatePartialHealthData(userResponses);
```

### 3.2 AI Response Processing
```typescript
// 1. Extract JSON from AI response
const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);

// 2. Parse and validate with Zod
const validatedExtractedData = ExtractedDataSchema.parse(parsedResponse);

// 3. Create final response
const finalResponse: ChatResponse = {
  ...parsedResponse,
  isComplete: false,
};
```

### 3.3 Error Handling
```typescript
try {
  // Process request
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid request data format' }, 
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: 'Failed to get chat response' }, 
    { status: 500 }
  );
}
```

## 4. Required Fields

The system collects the following health information:

### 4.1 Basic Information
- `age` - User's age
- `gender` - User's gender
- `height_weight` - Height and weight information

### 4.2 Lifestyle Factors
- `smoking_status` - Current smoking status
- `smoking_details` - Additional smoking information
- `alcohol_consumption` - Alcohol consumption patterns
- `diet_habits` - Dietary habits
- `physical_activity` - Physical activity level
- `sun_exposure` - Sun exposure patterns

### 4.3 Medical History
- `personal_cancer_history` - Personal cancer history
- `chronic_conditions` - Chronic medical conditions
- `radiation_exposure` - Radiation exposure history
- `family_cancer_history` - Family cancer history
- `family_cancer_details` - Details about family cancer

### 4.4 Symptoms
- `symptom_bowel_bladder` - Bowel/bladder symptoms
- `symptom_sore` - Sore symptoms
- `symptom_bleeding` - Bleeding symptoms
- `symptom_lump` - Lump symptoms
- `symptom_swallowing` - Swallowing difficulties
- `symptom_mole_change` - Mole changes
- `symptom_cough` - Cough symptoms

## 5. Risk Assessment

### 5.1 Scoring System
- **Low Risk**: 1-3 points
- **Moderate Risk**: 4-6 points  
- **High Risk**: 7-10 points

### 5.2 Risk Factors
- Age over 45/60
- Family cancer history
- Smoking status (current/former)
- Reported symptoms
- Lifestyle factors

### 5.3 Output
- Risk score (1-10)
- Risk category
- Key risk factors
- Recommendations
- Screening timeline
- Medical disclaimer

## 6. Benefits of Zod Implementation

### 6.1 Type Safety
- Compile-time type checking
- IntelliSense support
- Reduced runtime errors

### 6.2 Data Validation
- Automatic input validation
- Structured error messages
- Consistent data format

### 6.3 Maintainability
- Centralized schema definitions
- Easy to modify requirements
- Clear data contracts

### 6.4 Error Handling
- Specific validation errors
- Better debugging
- User-friendly error messages

## 7. API Endpoints

### 7.1 POST `/api/chat`
- **Purpose**: Process chat messages and extract health data
- **Input**: Chat history and current user responses
- **Output**: AI response with extracted data and completion status
- **Validation**: Uses Zod schemas for input/output validation

## 8. Frontend Integration

### 8.1 State Management
```typescript
const [userResponses, setUserResponses] = useState<Partial<UserHealthData>>({});
```

### 8.2 Type Safety
- All API responses are typed
- Data extraction is validated
- Risk assessment uses typed data

### 8.3 Error Handling
- Validation errors are caught and displayed
- Network errors are handled gracefully
- User feedback for all error states

## 9. Testing Considerations

### 9.1 Schema Validation
- Test with valid data
- Test with invalid data
- Test with missing fields

### 9.2 API Responses
- Test successful responses
- Test error responses
- Test edge cases

### 9.3 Data Extraction
- Test various user input formats
- Test AI response parsing
- Test data validation

## 10. Future Enhancements

### 10.1 Additional Validation
- Age range validation
- Medical terminology validation
- Symptom severity scoring

### 10.2 Enhanced Schemas
- Conditional field requirements
- Cross-field validation
- Dynamic field generation

### 10.3 Performance
- Schema caching
- Lazy validation
- Optimized parsing

This implementation provides a robust, type-safe, and maintainable chat system for health assessment with comprehensive data extraction and validation using Zod.
