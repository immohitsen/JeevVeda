# Blood Report Analyzer - Technical Documentation

## Overview

The Blood Report Analyzer is an AI-powered system that allows users to upload blood test reports (PDF, JPG, PNG) and receive comprehensive medical analysis including cancer risk assessment. The system combines OCR (Optical Character Recognition), PDF text extraction, and Google's Gemini AI for intelligent medical data interpretation.

## System Architecture

```
User Upload → File Validation → Text Extraction → Medical Validation → AI Analysis → Results Display
     ↓              ↓                ↓               ↓              ↓              ↓
  Frontend       Frontend         Backend         Backend        Backend       Frontend
```

## Detailed Workflow

### 1. User Upload Process (Frontend - page.tsx)

#### File Selection
- **Location**: `src/app/dashboard/blood-analyzer/page.tsx`
- **Component**: `BloodAnalyzerPage`
- **Supported Formats**: JPG, PNG, PDF
- **Size Limits**: 
  - Images: 10MB max
  - PDFs: 15MB max

```typescript
const handleFileSelect = (file: File | undefined) => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  // Validate file size
  const maxSize = file.type === 'application/pdf' ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
  
  // Set selected file and reset previous results
  setSelectedFile(file);
  setError(null);
  setResults(null);
};
```

#### Upload Interface Features
- **Drag & Drop**: Users can drag files onto the upload area
- **Click to Browse**: Alternative file selection method
- **Visual Feedback**: Shows file type icons and size information
- **File Preview**: Displays selected file details before processing
- **Error Handling**: Clear validation messages for invalid files

### 2. Analysis Initiation (Frontend)

When user clicks "Analyze Report":

```typescript
const analyzeReport = async () => {
  // Create FormData with the selected file
  const formData = new FormData();
  formData.append('file', selectedFile);
  
  // Show processing phases to user
  const phases = selectedFile.type === 'application/pdf' 
    ? ['Extracting text from PDF...', 'Analyzing medical data...', 'Generating insights...']
    : ['Performing OCR on image...', 'Analyzing medical data...', 'Generating insights...'];
  
  // Send POST request to API
  const response = await fetch('/api/blood-analyzer', {
    method: 'POST',
    body: formData,
  });
};
```

#### Processing Phases Display
- **Phase 1**: Text extraction (PDF parsing or OCR)
- **Phase 2**: Medical data analysis
- **Phase 3**: AI insights generation
- **Duration**: 30-90 seconds depending on file type
- **Progress Indicator**: Visual progress bar and status messages

### 3. Backend Processing (API Route - route.ts)

#### Initial Validation
**Location**: `src/app/api/blood-analyzer/route.ts`

```typescript
export async function POST(req: NextRequest) {
  // 1. Check Gemini API key configuration
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  
  // 2. Extract file from form data
  const file = formData.get('file') as File;
  
  // 3. Validate file type and size
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }
}
```

### 4. Text Extraction

#### For PDF Files
Uses dynamic import of `pdf-parse` library to avoid initialization issues:

```typescript
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Validate PDF header
  const pdfHeader = pdfBuffer.subarray(0, 4).toString();
  if (!pdfHeader.includes('%PDF')) {
    throw new Error('File does not appear to be a valid PDF');
  }
  
  // Dynamic import to avoid module initialization issues
  const pdf = await import('pdf-parse');
  const pdfParse = pdf.default || pdf;
  
  // Multiple parsing attempts for robustness
  try {
    // Standard parsing
    data = await pdfParse(pdfBuffer);
  } catch (standardError) {
    // Fallback with options
    const options = {
      max: 0, // Parse all pages
      normalizeWhitespace: false,
      disableCombineTextItems: false
    };
    data = await pdfParse(pdfBuffer, options);
  }
}
```

**PDF Processing Features**:
- Header validation to ensure valid PDF
- Multiple parsing strategies for different PDF types
- Handles both text-based and complex PDFs
- Graceful fallback for scanned PDFs (suggests image upload)
- Text cleaning and normalization

#### For Image Files (JPG/PNG)
Uses Tesseract.js for OCR:

```typescript
async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}%`);
      }
    },
  });
  
  // Validate OCR confidence
  if (data.confidence < 50) {
    throw new Error('OCR confidence too low. Please upload a clearer image.');
  }
  
  return data.text.trim();
}
```

**OCR Processing Features**:
- Progress tracking and logging
- Confidence validation (minimum 50%)
- English language optimization
- Character whitelist for medical terminology
- Error handling for unclear images

### 5. Medical Content Validation

Before sending to AI, the system validates that extracted text contains medical content:

```typescript
function validateMedicalText(text: string): boolean {
  const medicalKeywords = [
    'patient', 'report', 'test', 'result', 'blood', 'analysis', 'lab',
    'hemoglobin', 'cholesterol', 'glucose', 'creatinine', 'mg/dl', 'g/dl',
    'wbc', 'rbc', 'hgb', 'hct', 'mcv', 'mch', 'platelet', 'lymphocyte'
  ];
  
  const foundKeywords = medicalKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  // Require at least 2 medical keywords or numbers with medical units
  const hasNumbersWithUnits = /\d+\.?\d*\s*(mg\/dl|g\/dl|mmol\/l|u\/l)/i.test(text);
  
  return foundKeywords.length >= 2 || hasNumbersWithUnits;
}
```

### 6. AI Analysis with Google Gemini

#### Prompt Engineering
The system uses a comprehensive prompt to guide Gemini AI:

```typescript
const prompt = `
You are a medical AI assistant specializing in blood report analysis. 
Analyze this blood test report and provide comprehensive health insights 
including cancer risk assessment.

Blood Test Report Text: "${cleanedText}"

Please extract and return a JSON object with:
- patientInfo: Basic patient details
- testResults: Categorized test results with status
- cancerRiskAssessment: Comprehensive cancer risk analysis
- otherHealthRisks: Other health conditions
- insights: AI-generated recommendations
- overallAssessment: Summary assessment
`;
```

#### Analysis Focus Areas

**Cancer Risk Assessment**:
- White blood cell abnormalities (leukemia indicators)
- Tumor markers (PSA, CEA, AFP, CA-125)
- Liver function tests (liver cancer risk)
- Inflammatory markers (CRP, ESR)
- Anemia patterns (blood cancers)

**Other Health Risks**:
- Diabetes risk (glucose, HbA1c)
- Cardiovascular risk (cholesterol, triglycerides)
- Kidney disease (creatinine, BUN, GFR)
- Liver disease (ALT, AST, bilirubin)
- Thyroid disorders (TSH, T3, T4)
- Nutritional deficiencies (B12, folate, iron)

### 7. Response Processing

#### JSON Extraction and Validation
```typescript
// Extract JSON from AI response
const jsonMatch = responseText.match(/\{[\s\S]*\}/);

// Parse and validate
analysisResult = JSON.parse(jsonMatch[0]);

// Ensure meaningful results
if (!analysisResult.testResults || analysisResult.testResults.length === 0) {
  return NextResponse.json({
    error: 'No medical test data could be extracted',
    extractedText: cleanedText.substring(0, 500) + '...'
  }, { status: 400 });
}
```

#### API Response Structure
```typescript
{
  success: true,
  data: {
    patientInfo: { name, age, gender, reportDate },
    testResults: [
      {
        category: "Complete Blood Count",
        tests: [
          {
            testName: "Hemoglobin",
            value: "13.8",
            unit: "g/dL",
            referenceRange: "12.0-17.5",
            status: "normal"
          }
        ]
      }
    ],
    cancerRiskAssessment: {
      overallRisk: "low|moderate|high|unable_to_determine",
      riskFactors: [...],
      cancerTypes: [...],
      recommendations: [...]
    },
    otherHealthRisks: [...],
    insights: [...],
    overallAssessment: "..."
  },
  metadata: {
    fileName, fileSize, fileType, processedAt,
    extractedTextLength, ocrMethod
  }
}
```

### 8. Results Display (Frontend)

#### Comprehensive Results Interface

**Patient Information Card**:
- Name, age, gender, report date
- Color-coded sections for easy reading

**Test Results Table**:
- Categorized by test type (CBC, Metabolic Panel, etc.)
- Status indicators (normal, high, low, critical)
- Reference ranges for each test
- Color coding and icons for quick assessment

**Cancer Risk Assessment**:
- Overall risk level with visual indicators
- Specific cancer types and risk levels
- Risk factors with explanations
- Evidence-based recommendations

**Other Health Risks**:
- Diabetes, cardiovascular, kidney disease risks
- Risk indicators and descriptions
- Preventive recommendations

**AI Insights**:
- Personalized health recommendations
- Lifestyle suggestions
- Follow-up recommendations

#### Interactive Features
- **Status Icons**: Visual indicators for test results
- **Color Coding**: Risk levels with appropriate colors
- **Expandable Sections**: Detailed information on demand
- **Download Option**: Export results as report
- **Reset Function**: Analyze another report

### 9. Error Handling

#### Comprehensive Error Management

**File Validation Errors**:
- Invalid file type
- File size exceeded
- Corrupted files

**Text Extraction Errors**:
- OCR confidence too low
- PDF parsing failures
- Scanned document detection

**AI Processing Errors**:
- API key issues
- Service unavailability
- Response parsing failures

**User-Friendly Error Messages**:
```typescript
// Example error with solution
if (error.includes('scanned')) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded">
      <p className="text-blue-700 font-medium">💡 Suggested Solution:</p>
      <p className="text-blue-600">
        Take a clear photo of your blood report and upload it as JPG or PNG instead.
      </p>
    </div>
  );
}
```

## Security Considerations

1. **API Key Protection**: Environment variable validation
2. **File Size Limits**: Prevents system overload
3. **File Type Validation**: Only allows safe file types
4. **Content Validation**: Ensures medical relevance
5. **Error Sanitization**: No sensitive data in error messages

## Performance Optimizations

1. **Dynamic Imports**: Prevents module initialization issues
2. **Progress Tracking**: User feedback during processing
3. **Efficient Text Processing**: Optimized cleaning and validation
4. **Fallback Strategies**: Multiple parsing approaches
5. **Caching**: Future enhancement for repeated analyses

## Future Enhancements

1. **Multi-language Support**: OCR for different languages
2. **Batch Processing**: Multiple file uploads
3. **Historical Tracking**: Trend analysis over time
4. **Integration**: Hospital systems integration
5. **Mobile Optimization**: Camera-based upload
6. **Advanced AI**: Specialist AI models for specific tests

## Technical Dependencies

- **Frontend**: React, TypeScript, Next.js
- **OCR**: Tesseract.js
- **PDF**: pdf-parse (dynamic import)
- **AI**: Google Gemini AI (via @google/genai)
- **Styling**: Tailwind CSS, Lucide icons
- **Backend**: Next.js API routes

This workflow ensures reliable, accurate, and user-friendly blood report analysis with comprehensive health insights and cancer risk assessment.
