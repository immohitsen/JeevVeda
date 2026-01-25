export interface MRIReportData {
  id: string;
  createdAt?: string;
  reportType?: "MRI_ANALYSIS";
  patient: {
    id: string;
    name: string;
    age: number;
    sex: "Male" | "Female" | "Other";
    dob: string;
  };
  study: {
    scanDate: string;
    modality: string;
    technique?: string;
  };
  clinicalInfo?: string;
  findings: {
    sectionTitle: string;
    content: string; // Can be markdown or plain text
  }[];
  impression: string[];
  // Optional raw fields from AI API
  prediction?: string;
  confidence?: number;
  probabilities?: {
    [key: string]: number;
  };
  aiAnalysis?: {
    riskScore: number; // 0-100
    riskLevel: "Low" | "Medium" | "High";
    abnormalities: {
      name: string;
      location: string;
      confidence: number;
    }[];
    summary: string;
  };
  images?: {
    url: string;
    caption: string;
  }[];
}
