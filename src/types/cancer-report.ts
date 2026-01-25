export interface RiskAssessment {
    riskScore: number;
    riskCategory: string;
    keyRiskFactors: string[];
    recommendations: string[];
    screeningTimeline: string;
    interpretation: string;
    disclaimer: string;
}
