import React from "react";
import { BloodReportData, TestStatus, RiskLevel } from "@/types/blood-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Brain, 
  Droplet,
  ArrowRight
} from "lucide-react";

interface BloodReportViewerProps {
  report: BloodReportData;
}

export function BloodReportViewer({ report }: BloodReportViewerProps) {
  const { reportData } = report;

  const getStatusColor = (status: TestStatus | string) => {
    switch (status) {
      case "normal": return "text-green-600 bg-green-50 border-green-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "low": return "text-blue-600 bg-blue-50 border-blue-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskColor = (risk: RiskLevel | string) => {
    switch (risk) {
      case "low": return "bg-green-500/10 text-green-700 border-green-200";
      case "moderate": return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "high": return "bg-red-500/10 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const isLowRisk = !reportData.cancerRiskAssessment?.overallRisk || reportData.cancerRiskAssessment.overallRisk === "low";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-1">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-800 to-red-500 dark:from-red-100 dark:to-red-400">
            Blood Analysis Report
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report ID: <span className="font-mono text-foreground font-medium">{report.id}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
             <Badge className={`px-4 py-1.5 text-sm sm:text-base border ${isLowRisk ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"}`}>
                Risk Profile: {isLowRisk ? "Low" : (reportData.cancerRiskAssessment?.overallRisk?.toUpperCase() || "UNKNOWN")}
             </Badge>
             <Badge variant="outline" className="px-4 py-1.5 text-sm sm:text-base">
                AI Verified
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Patient details */}
        <div className="space-y-6 md:col-span-1">
          <Card className="shadow-sm border-muted-foreground/10 overflow-hidden">
            <CardHeader className="bg-red-50/50 dark:bg-red-950/10 pb-4 border-b border-red-100 dark:border-red-900/20">
                <CardTitle className="text-lg flex items-center gap-2 text-red-900 dark:text-red-100">
                    <User className="w-5 h-5 text-red-500" />
                    Patient Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-5">
                 <div className="flex justify-between border-b pb-3 border-dashed">
                   <span className="text-base text-muted-foreground">Name</span>
                   <span className="font-medium text-base">{reportData.patientInfo?.name || report.patient.name}</span>
                 </div>
                 <div className="flex justify-between border-b pb-3 border-dashed">
                   <span className="text-base text-muted-foreground">Age / Sex</span>
                   <span className="font-medium text-base">
                     {reportData.patientInfo?.age || report.patient.age} / {reportData.patientInfo?.gender || report.patient.sex}
                   </span>
                 </div>
                 <div className="flex justify-between border-b pb-3 border-dashed">
                    <span className="text-base text-muted-foreground">Report Date</span>
                    <span className="font-medium text-base">{reportData.patientInfo?.reportDate || "N/A"}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-base text-muted-foreground">File Name</span>
                    <span className="font-medium text-base truncate max-w-[150px]" title={report.fileName}>{report.fileName || "N/A"}</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Assessment Summary Card */}
          <Card className="shadow-sm border-muted-foreground/10">
             <CardHeader className="bg-blue-50/50 dark:bg-blue-950/10 pb-4 border-b border-blue-100">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Summary
                </CardTitle>
             </CardHeader>
             <CardContent className="pt-6">
               <p className="text-base leading-relaxed text-muted-foreground">
                 {reportData.overallAssessment || "No summary available."}
               </p>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="space-y-6 md:col-span-2">
            
            {/* AI Risk Analysis */}
             {reportData.cancerRiskAssessment && (
                <Card className={`shadow-sm border ${isLowRisk ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}>
                    <CardHeader className="pb-3">
                        <CardTitle className={`text-lg flex items-center gap-2 ${isLowRisk ? "text-green-800" : "text-red-800"}`}>
                            <Brain className="w-5 h-5" />
                            Cancer Risk Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                             {isLowRisk ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                             ) : (
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                             )}
                             <div>
                                <h3 className={`font-bold text-xl ${isLowRisk ? "text-green-900" : "text-red-900"}`}>
                                    {isLowRisk ? "NO IMMEDIATE RISK DETECTED" : reportData.cancerRiskAssessment.overallRisk.replace(/_/g, ' ').toUpperCase()}
                                </h3>
                                <p className="text-base text-muted-foreground mt-1">
                                    {isLowRisk 
                                        ? "No specific tumor markers or abnormal cell counts indicating cancer were found." 
                                        : "Certain markers indicate a potential risk. Please consult a specialist."}
                                </p>
                             </div>
                        </div>

                        {!isLowRisk && reportData.cancerRiskAssessment.riskFactors.length > 0 && (
                            <div className="mt-6 bg-white/50 rounded-lg p-5 border border-red-100">
                                <h4 className="font-semibold text-base text-red-900 mb-4 uppercase tracking-wide">Identified Risk Factors</h4>
                                <ul className="space-y-3">
                                    {reportData.cancerRiskAssessment.riskFactors.map((factor, idx) => (
                                        <li key={idx} className="flex justify-between items-start text-base">
                                            <span>
                                                <span className="font-medium text-red-950 block">{factor.factor}</span>
                                                <span className="text-muted-foreground block text-sm mt-0.5">{factor.significance}</span>
                                            </span>
                                            <Badge variant="outline" className={`${getRiskColor(factor.riskLevel)} border-0 text-xs px-2 py-1`}>
                                                {factor.riskLevel.toUpperCase()}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
             )}

            {/* Test Results */}
            {reportData.testResults && reportData.testResults.length > 0 && (
              <Card className="shadow-sm border-muted-foreground/10">
                <CardHeader className="border-b border-border/40 pb-4">
                     <CardTitle className="text-xl flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-red-500" />
                        Bio-Markers & Test Results
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-0">
                    <div className="divide-y divide-border/40">
                        {reportData.testResults.map((category, idx) => (
                            <div key={idx} className="p-6">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    {category.category || "General Tests"}
                                </h3>
                                <div className="space-y-3">
                                    {category.tests.map((test, tIdx) => (
                                        <div key={tIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-lg hover:bg-muted/50 transition-colors group">
                                            <div className="flex-1">
                                                <div className="font-medium text-base text-foreground">{test.testName}</div>
                                                <div className="text-sm text-muted-foreground">Ref: {test.referenceRange || "N/A"}</div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="font-mono font-medium text-base">{test.value} <span className="text-sm text-muted-foreground">{test.unit}</span></div>
                                                </div>
                                                <Badge variant="outline" className={`w-28 py-1 justify-center text-sm font-medium ${getStatusColor(test.status)}`}>
                                                    {test.status?.toUpperCase() || "UNKNOWN"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {reportData.cancerRiskAssessment?.recommendations && reportData.cancerRiskAssessment.recommendations.length > 0 && (
                <Card className="shadow-sm border-muted-foreground/10 bg-slate-50/50 dark:bg-slate-900/20">
                     <CardHeader className="pb-3">
                         <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
                             <CheckCircle className="w-5 h-5 text-emerald-500" />
                             Recommendations
                         </CardTitle>
                     </CardHeader>
                     <CardContent className="pt-6">
                         <ul className="space-y-4">
                             {reportData.cancerRiskAssessment.recommendations.map((rec, idx) => (
                                 <li key={idx} className="flex gap-4 text-base text-foreground/90 leading-relaxed">
                                     <ArrowRight className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                                     <span>{rec}</span>
                                 </li>
                             ))}
                         </ul>
                     </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
