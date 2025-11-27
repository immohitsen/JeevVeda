# Reports Database Implementation Plan - Jeev Veda Medical SaaS

## 📋 Executive Summary

This document outlines the complete plan to implement a professional reports storage system for all medical tests and analyses in the Jeev Veda platform. The system will store reports from Blood Analyzer, MRI Analyzer, and Chatbot Risk Assessments in MongoDB with proper patient association and comprehensive metadata.

---

## 🎯 Project Objectives

1. **Persistent Storage**: Save all medical reports and analyses to MongoDB
2. **Patient Association**: Link every report to the authenticated user
3. **Historical Access**: Enable users to view all past reports and analyses
4. **Professional Structure**: Organize data with proper schemas and validation
5. **Unified System**: Single reports collection with polymorphic structure
6. **Future-Ready**: Extensible design for additional report types

---

## 📊 Current System Analysis

### Existing Infrastructure
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT-based with user sessions
- **User Model**: Basic patient demographics stored
- **Report Generation**: 3 active systems (Blood, MRI, Chatbot)

### Critical Gap
**NO REPORT PERSISTENCE** - All analysis results are lost after page refresh or logout.

---

## 🏗️ Proposed Database Architecture

### Design Philosophy
- **Single Collection Approach**: One `reports` collection for all report types
- **Discriminator Pattern**: Use `reportType` field to distinguish report categories
- **Polymorphic Schema**: Base fields + type-specific nested objects
- **Indexed Queries**: Fast retrieval by userId, reportType, and date

### Why Single Collection?
✅ Unified report history view
✅ Easier cross-report analytics
✅ Simplified pagination and sorting
✅ Single API endpoint for all reports
✅ Consistent metadata structure

---

## 📐 Database Schema Design

### Base Report Schema (All Reports)

```javascript
const ReportSchema = new mongoose.Schema({
  // === CORE IDENTIFICATION ===
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'patientdatas',  // Links to existing user model
    required: true,
    index: true
  },

  reportType: {
    type: String,
    enum: ['BLOOD_ANALYSIS', 'MRI_SCAN', 'RISK_ASSESSMENT'],
    required: true,
    index: true
  },

  // === TEMPORAL METADATA ===
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  // === FILE METADATA (if applicable) ===
  fileMetadata: {
    originalFileName: String,
    fileSize: Number,          // in bytes
    fileType: String,          // 'image/png', 'application/pdf', etc.
    uploadedAt: Date
  },

  // === REPORT STATUS ===
  status: {
    type: String,
    enum: ['PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED'],
    default: 'COMPLETED'
  },

  // === TYPE-SPECIFIC DATA (Polymorphic) ===

  // BLOOD ANALYSIS REPORT DATA
  bloodAnalysisData: {
    patientInfo: {
      name: String,
      age: Number,
      gender: String,
      reportDate: Date
    },
    testResults: [{
      category: String,
      tests: [{
        testName: String,
        value: String,
        unit: String,
        referenceRange: String,
        status: {
          type: String,
          enum: ['normal', 'high', 'low', 'critical', 'unknown']
        }
      }]
    }],
    cancerRiskAssessment: {
      overallRisk: {
        type: String,
        enum: ['low', 'moderate', 'high', 'unable_to_determine']
      },
      riskFactors: [{
        factor: String,
        value: String,
        significance: String,
        riskLevel: String
      }],
      cancerTypes: [{
        type: String,
        riskLevel: String,
        indicators: [String]
      }],
      recommendations: [String]
    },
    otherHealthRisks: [{
      condition: String,
      risk: String,
      indicators: [String],
      description: String
    }],
    insights: [String],
    overallAssessment: String,
    extractionMetadata: {
      ocrMethod: String,        // 'tesseract' or 'pdf-parse'
      extractedTextLength: Number,
      processingTime: Number    // in milliseconds
    }
  },

  // MRI ANALYSIS DATA
  mriAnalysisData: {
    prediction: String,         // 'cancer' or 'not_cancer'
    confidence: Number,         // 0.0 to 1.0
    modelVersion: String,       // e.g., 'resnet-50-v1'
    scanType: String,           // 'brain', 'lung', 'chest', etc.
    findings: String,
    recommendations: [String]
  },

  // RISK ASSESSMENT DATA (Chatbot)
  riskAssessmentData: {
    collectedData: {
      // Basic Information
      age: Number,
      gender: String,
      height_weight: String,

      // Lifestyle Factors
      smoking_status: String,
      alcohol_consumption: String,
      diet_habits: String,
      physical_activity: String,
      sun_exposure: String,

      // Medical History
      personal_cancer_history: String,
      chronic_conditions: String,
      radiation_exposure: String,

      // Family History
      family_cancer_history: String,
      family_cancer_details: String,

      // Symptoms
      bowel_bladder: String,
      sore: String,
      bleeding: String,
      lump: String,
      swallowing: String,
      mole_change: String,
      cough: String,

      // Regional (India-specific)
      tobacco_chewing: String,
      betel_nut_consumption: String,
      occupational_hazards: String,
      water_source: String,
      air_pollution: String,
      stress_levels: String,
      sleep_patterns: String
    },

    assessment: {
      riskScore: {
        type: Number,
        min: 1,
        max: 10
      },
      riskCategory: {
        type: String,
        enum: ['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk']
      },
      keyRiskFactors: [String],
      recommendations: [String],
      screeningTimeline: String,
      interpretation: String,
      disclaimer: String
    },

    conversationSummary: String,
    chatDuration: Number,       // in seconds
    completionDate: Date
  },

  // === TAGS & NOTES (Future Enhancement) ===
  tags: [String],
  userNotes: String,

  // === SHARING & ACCESS (Future Enhancement) ===
  sharedWith: [{
    email: String,
    sharedAt: Date,
    expiresAt: Date
  }]

}, {
  timestamps: true,  // Auto-manages createdAt and updatedAt
  collection: 'reports'
});

// === INDEXES FOR PERFORMANCE ===
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ userId: 1, reportType: 1, createdAt: -1 });
ReportSchema.index({ reportType: 1, status: 1 });

// === VIRTUAL FIELDS ===
ReportSchema.virtual('reportTitle').get(function() {
  const typeMap = {
    'BLOOD_ANALYSIS': 'Blood Analysis Report',
    'MRI_SCAN': 'MRI Scan Report',
    'RISK_ASSESSMENT': 'Cancer Risk Assessment'
  };
  return typeMap[this.reportType] || 'Medical Report';
});

// === METHODS ===
ReportSchema.methods.getSummary = function() {
  switch(this.reportType) {
    case 'BLOOD_ANALYSIS':
      return {
        title: 'Blood Analysis',
        riskLevel: this.bloodAnalysisData?.cancerRiskAssessment?.overallRisk,
        date: this.createdAt,
        testsCount: this.bloodAnalysisData?.testResults?.length || 0
      };
    case 'MRI_SCAN':
      return {
        title: 'MRI Scan',
        result: this.mriAnalysisData?.prediction,
        confidence: this.mriAnalysisData?.confidence,
        date: this.createdAt
      };
    case 'RISK_ASSESSMENT':
      return {
        title: 'Risk Assessment',
        riskScore: this.riskAssessmentData?.assessment?.riskScore,
        riskCategory: this.riskAssessmentData?.assessment?.riskCategory,
        date: this.createdAt
      };
    default:
      return { title: 'Report', date: this.createdAt };
  }
};

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
```

---

## 🔄 Data Flow Architecture

### 1. Blood Analyzer Flow (Updated)
```
User Uploads File → /api/blood-analyzer
    ↓
Extract Text (OCR/PDF)
    ↓
AI Analysis (Gemini)
    ↓
Parse JSON Response
    ↓
✨ NEW: Save to Reports DB
    ↓
Return Report ID + Data to Frontend
    ↓
Display Results + "View in History" Link
```

### 2. MRI Analyzer Flow (Updated)
```
User Uploads MRI Image → /api/mri-predict
    ↓
Forward to ResNet-50 API
    ↓
Receive Prediction
    ↓
✨ NEW: Save to Reports DB
    ↓
Return Report ID + Prediction
    ↓
Display Results + "View in History" Link
```

### 3. Risk Assessment Flow (Updated)
```
User Completes Chat → /api/assess-risk
    ↓
Collected Health Data Sent
    ↓
AI Risk Assessment (Gemini)
    ↓
Generate Risk Score & Recommendations
    ↓
✨ NEW: Save to Reports DB (with chat history)
    ↓
Return Report ID + Assessment
    ↓
Display Results + "View in History" Link
```

### 4. NEW: Reports History Flow
```
User Navigates to Reports History → /dashboard/report-history
    ↓
GET /api/reports?userId={id}&page={n}&type={filter}
    ↓
Fetch Reports from DB (paginated)
    ↓
Display in Professional Table/Cards
    ↓
User Clicks "View Details"
    ↓
GET /api/reports/{reportId}
    ↓
Display Full Report with Download Option
```

---

## 🛠️ Implementation Steps

### Phase 1: Database Setup (Step 1-2)

**Step 1: Create Report Model**
- File: `/src/models/reportModel.js`
- Implement schema as designed above
- Add indexes and virtual fields
- Export model

**Step 2: Create API Routes**
- `/api/reports/route.ts` - List all reports (GET), Create report (POST)
- `/api/reports/[id]/route.ts` - Get single report (GET), Update (PATCH), Delete (DELETE)

### Phase 2: Integration with Existing Systems (Step 3-5)

**Step 3: Update Blood Analyzer**
- Modify `/api/blood-analyzer/route.ts`
- After successful AI analysis, create Report document
- Store full analysis in `bloodAnalysisData` field
- Return report ID with response

**Step 4: Update MRI Analyzer**
- Modify `/api/mri-predict/route.ts`
- After receiving prediction from ResNet-50, create Report document
- Store prediction in `mriAnalysisData` field
- Return report ID with response

**Step 5: Update Risk Assessment**
- Modify `/api/assess-risk/route.ts`
- Save collected health data + assessment to Report document
- Store in `riskAssessmentData` field
- Return report ID with response

### Phase 3: Frontend Updates (Step 6-7)

**Step 6: Update Result Pages**
- Add "Save to Reports" confirmation messages
- Add "View in History" buttons linking to report details
- Show report ID in UI

**Step 7: Create Reports History Page**
- Professional table/card view
- Filters: All Reports, Blood Analysis, MRI, Risk Assessment
- Date range picker
- Search functionality
- Pagination (20 reports per page)
- Quick summary cards
- "View Details" modal or page

### Phase 4: Testing & Polish (Step 8-9)

**Step 8: Testing**
- Test report creation for all three types
- Test report retrieval and pagination
- Test filters and search
- Test with multiple users (data isolation)

**Step 9: UI/UX Polish**
- Professional report cards design
- Export to PDF functionality
- Print-friendly views
- Loading states and error handling

---

## 📝 API Endpoints Specification

### 1. Create Report (POST /api/reports)
```typescript
Request Body:
{
  reportType: 'BLOOD_ANALYSIS' | 'MRI_SCAN' | 'RISK_ASSESSMENT',
  fileMetadata?: { ... },
  bloodAnalysisData?: { ... },
  mriAnalysisData?: { ... },
  riskAssessmentData?: { ... }
}

Response:
{
  success: true,
  reportId: '507f1f77bcf86cd799439011',
  message: 'Report saved successfully'
}
```

### 2. Get All Reports (GET /api/reports)
```typescript
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- reportType: 'BLOOD_ANALYSIS' | 'MRI_SCAN' | 'RISK_ASSESSMENT' | 'ALL'
- startDate: ISO date string
- endDate: ISO date string
- search: string (searches in tags, notes)

Response:
{
  success: true,
  reports: [
    {
      _id: '...',
      reportType: 'BLOOD_ANALYSIS',
      createdAt: '2025-01-15T10:30:00Z',
      summary: { ... },
      status: 'COMPLETED'
    }
  ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalReports: 87,
    hasNext: true,
    hasPrev: false
  }
}
```

### 3. Get Single Report (GET /api/reports/[id])
```typescript
Response:
{
  success: true,
  report: {
    _id: '...',
    userId: '...',
    reportType: 'BLOOD_ANALYSIS',
    createdAt: '...',
    bloodAnalysisData: { /* full data */ },
    fileMetadata: { ... },
    status: 'COMPLETED'
  }
}
```

### 4. Delete Report (DELETE /api/reports/[id])
```typescript
Response:
{
  success: true,
  message: 'Report deleted successfully'
}
```

---

## 🎨 UI/UX Design Specifications

### Reports History Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  📊 Your Medical Reports                    [+ New Test] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [All Reports ▼] [Date Range] [Search...]     Sort: ▼   │
│                                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 📄 Blood    │ │ 🧠 MRI      │ │ ⚠️  Risk     │       │
│  │ Analysis    │ │ Scan        │ │ Assessment  │       │
│  │ Jan 15, 2025│ │ Jan 10, 2025│ │ Jan 5, 2025 │       │
│  │ Low Risk    │ │ Normal      │ │ Moderate    │       │
│  │ [View]      │ │ [View]      │ │ [View]      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                           │
│  << Previous  Page 1 of 5  Next >>                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Report Detail Modal

```
┌─────────────────────────────────────────────────────────┐
│  Blood Analysis Report                        [✕ Close]  │
│  January 15, 2025 at 10:30 AM                            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📋 Patient Information                                   │
│  Name: John Doe | Age: 45 | Gender: Male                │
│                                                           │
│  🔬 Test Results                                          │
│  ├─ Complete Blood Count                                 │
│  │  ├─ Hemoglobin: 13.5 g/dL ✅ Normal                   │
│  │  ├─ WBC: 7,200 /µL ✅ Normal                          │
│  │  └─ Platelets: 250,000 /µL ✅ Normal                  │
│  └─ ...                                                   │
│                                                           │
│  ⚠️  Cancer Risk Assessment                              │
│  Overall Risk: LOW                                        │
│  Risk Factors: Age (moderate), Family history (low)      │
│                                                           │
│  💡 Recommendations                                       │
│  • Continue regular checkups                              │
│  • Maintain healthy lifestyle                             │
│                                                           │
│  [📥 Download PDF] [📄 Download JSON] [🖨️ Print]        │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Considerations

1. **Authentication**: All report APIs require valid JWT token
2. **Authorization**: Users can only access their own reports
3. **Data Validation**: Zod schemas for all API inputs
4. **File Size Limits**: Enforce max file sizes (already implemented)
5. **Rate Limiting**: Consider implementing rate limits on report creation
6. **Sensitive Data**: Encrypt sensitive health information (future enhancement)
7. **GDPR Compliance**: Add user data export and deletion capabilities

---

## 📈 Performance Optimizations

1. **Database Indexes**:
   - `userId + createdAt` (most common query)
   - `reportType + status`

2. **Pagination**: Limit results to 20 per page

3. **Projection**: Only fetch required fields for list views

4. **Caching**: Consider Redis cache for frequently accessed reports (future)

5. **Lazy Loading**: Load report details only when requested

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Create blood analysis report
- [ ] Create MRI scan report
- [ ] Create risk assessment report
- [ ] Fetch reports with pagination
- [ ] Filter reports by type
- [ ] Filter reports by date range
- [ ] Get single report details
- [ ] Delete report
- [ ] Verify user isolation (can't access others' reports)
- [ ] Test with invalid auth tokens

### Frontend Testing
- [ ] Upload blood report and verify save
- [ ] Upload MRI scan and verify save
- [ ] Complete risk assessment and verify save
- [ ] View reports history page
- [ ] Test filters and search
- [ ] Test pagination
- [ ] View report details modal
- [ ] Download JSON report
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test loading states
- [ ] Test error handling

---

## 🚀 Future Enhancements (Phase 2)

1. **PDF Export**: Generate professional PDF reports
2. **Report Sharing**: Share reports with doctors via secure links
3. **Comparison View**: Compare multiple reports side-by-side
4. **Trend Analysis**: Visualize health metrics over time
5. **Notifications**: Email/SMS alerts for critical findings
6. **Doctor Portal**: Separate interface for healthcare providers
7. **Appointment Booking**: Link reports to appointments
8. **Data Export**: Export all health data in standard formats (FHIR, HL7)

---

## 📊 Success Metrics

1. **Report Save Rate**: 100% of analyses should be saved
2. **Retrieval Speed**: < 500ms for report list queries
3. **User Engagement**: Users accessing report history regularly
4. **Data Integrity**: Zero data loss incidents
5. **Performance**: Handle 1000+ reports per user without slowdown

---

## 🎯 Implementation Timeline

**Week 1: Database & API**
- Day 1-2: Create report model and database setup
- Day 3-4: Build API routes (CRUD operations)
- Day 5: Testing and validation

**Week 2: Integration**
- Day 1: Integrate Blood Analyzer
- Day 2: Integrate MRI Analyzer
- Day 3: Integrate Risk Assessment
- Day 4-5: Testing integrated flows

**Week 3: Frontend**
- Day 1-2: Build Reports History page
- Day 3: Build Report Details view
- Day 4: Add filters, search, pagination
- Day 5: UI/UX polish and responsive design

**Week 4: Testing & Launch**
- Day 1-2: End-to-end testing
- Day 3: Bug fixes
- Day 4: Documentation
- Day 5: Deploy to production

---

## 📚 Technical Documentation Links

- MongoDB Indexes: https://www.mongodb.com/docs/manual/indexes/
- Mongoose Discriminators: https://mongoosejs.com/docs/discriminators.html
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Zod Validation: https://zod.dev/

---

## ✅ Conclusion

This comprehensive plan provides a professional, scalable, and maintainable solution for storing all medical reports in the Jeev Veda platform. The single-collection polymorphic approach ensures:

- **Unified Data Model**: Easy to query across all report types
- **Extensibility**: Simple to add new report types in the future
- **Performance**: Properly indexed for fast queries
- **Professional Structure**: Industry-standard medical data organization
- **User-Centric**: Easy access to complete health history

**Next Steps**: Review this plan, provide feedback, and proceed with implementation starting with Phase 1 (Database Setup).
