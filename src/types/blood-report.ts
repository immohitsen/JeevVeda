export interface PatientInfo {
  name?: string | null;
  age?: number | string | null;
  gender?: string | null;
  reportDate?: string | null;
}

export type TestStatus = "normal" | "high" | "low" | "critical" | "unknown";

export interface TestResult {
  testName: string;
  value: string | number;
  unit: string;
  referenceRange?: string;
  status: TestStatus;
}

export interface TestCategory {
  category?: string;
  tests: TestResult[];
}

export type RiskLevel = "low" | "moderate" | "high";
export type OverallCancerRisk = RiskLevel;

export interface CancerRiskFactor {
  factor: string;
  value: string;
  significance: string;
  riskLevel: RiskLevel;
}

export interface CancerType {
  type: string;
  riskLevel: RiskLevel;
  indicators: string[];
}

export interface CancerRiskAssessment {
  overallRisk: OverallCancerRisk;
  riskFactors: CancerRiskFactor[];
  cancerTypes: CancerType[];
  recommendations: string[];
}

export interface OtherHealthRisk {
  condition: string;
  risk: RiskLevel;
  indicators: string[];
  description: string;
}

export interface BloodAnalysisResults {
  patientInfo?: PatientInfo;
  overallAssessment?: string;
  testResults?: TestCategory[];
  cancerRiskAssessment?: CancerRiskAssessment;
  otherHealthRisks?: OtherHealthRisk[];
  insights?: string[];
}

// Wrapper for the full report object stored in DB or passed to viewer
export interface BloodReportData {
  id: string;
  reportType: "BLOOD_ANALYSIS";
  patient: {
    id: string;
    name: string;
    age: number;
    sex: string;
    dob?: string;
  };
  fileUrl?: string; // URL to original PDF/Image if available
  fileName?: string;
  createdAt?: string;
  
  // The actual analysis content
  reportData: BloodAnalysisResults;
}
