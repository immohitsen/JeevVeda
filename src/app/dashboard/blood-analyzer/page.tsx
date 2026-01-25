// src/app/dashboard/blood-analyzer/page.tsx
"use client";

import { useState, useRef } from "react";
import {
  FileImage,
  FileText,
  X,
  Brain,
  CheckCircle,
  Download,
  AlertTriangle,
  Activity,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";


/* ===== Types aligned with API ===== */
interface PatientInfo {
  name?: string | null;
  age?: number | string | null;
  gender?: string | null;
  reportDate?: string | null;
}

type TestStatus = "normal" | "high" | "low" | "critical" | "unknown";

interface TestResult {
  testName: string;
  value: string | number;
  unit: string;
  referenceRange?: string;
  status: TestStatus;
}

interface TestCategory {
  category?: string;
  tests: TestResult[];
}

type RiskLevel = "low" | "moderate" | "high" | "low_to_moderate";
type OverallCancerRisk = RiskLevel | "unable_to_determine";

interface CancerRiskFactor {
  factor: string;
  value: string;
  significance: string;
  riskLevel: RiskLevel;
}

interface CancerType {
  type: string;
  riskLevel: RiskLevel;
  indicators: string[];
}

interface CancerRiskAssessment {
  overallRisk: OverallCancerRisk;
  riskFactors: CancerRiskFactor[];
  cancerTypes: CancerType[];
  recommendations: string[];
}

interface OtherHealthRisk {
  condition: string;
  risk: RiskLevel;
  indicators: string[];
  description: string;
}

interface BloodAnalysisResults {
  patientInfo?: PatientInfo;
  overallAssessment?: string;
  testResults?: TestCategory[];
  cancerRiskAssessment?: CancerRiskAssessment;
  otherHealthRisks?: OtherHealthRisk[];
  insights?: string[];
}

/* ===== Component ===== */
export default function BloodAnalyzerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BloodAnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingPhase, setProcessingPhase] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    // ✅ Include image/jpg too (backend accepts it)
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG, PDF files are allowed");
      return;
    }

    const maxSize = file.type === "application/pdf" ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = file.type === "application/pdf" ? "15MB" : "10MB";
      setError(`File size must be less than ${maxSizeMB}`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResults(null);
    setReportId(null);
  };

  const analyzeReport = async () => {
    if (!selectedFile) return;

    // Preflight: ensure we truly have a Browser File object
    const isValidBrowserFile =
      typeof (selectedFile as File)?.arrayBuffer === "function" &&
      typeof selectedFile.size === "number" &&
      typeof selectedFile.type === "string";
    if (!isValidBrowserFile) {
      setError(
        "No valid file selected. Please click 'Select File' and choose a PDF/JPG/PNG from your device."
      );
      fileInputRef.current?.click();
      return;
    }

    setProcessing(true);
    setError(null);

    const phases =
      selectedFile.type === "application/pdf"
        ? ["Extracting text from PDF...", "Analyzing medical data...", "Generating insights..."]
        : ["Performing OCR on image...", "Analyzing medical data...", "Generating insights..."];

    let phaseIndex = 0;
    setProcessingPhase(phases[phaseIndex]);

    const phaseInterval = setInterval(() => {
      phaseIndex++;
      if (phaseIndex < phases.length) setProcessingPhase(phases[phaseIndex]);
    }, 3000);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/blood-analyzer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      clearInterval(phaseInterval);

      if (!response.ok || !data?.success) {
        const errorMsg =
          data?.error ||
          (typeof data === "string" ? data : "Analysis failed. Please try again with a clearer file.");
        const details = data?.details ? `\n\nDetails: ${data.details}` : "";
        throw new Error(errorMsg + details);
      }

      console.log('Received data from API:', data);
      console.log('Patient info:', data.data?.patientInfo);

      // ✅ data.data is the JSON produced by the backend
      setResults(data.data as BloodAnalysisResults);
      if (data.reportId) setReportId(data.reportId);
    } catch (e: unknown) {
      clearInterval(phaseInterval);
      console.error("Analysis failed:", e);
      const msg =
        e instanceof Error ? e.message : "Failed to analyze the report. Please try again.";
      setError(msg);
    } finally {
      setProcessing(false);
      setProcessingPhase("");
    }
  };

  const getStatusColor = (status: TestStatus | string) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      case "critical":
        return "text-red-600 bg-red-100";
      case "unknown":
      default:
        return "text-gray-600 bg-gray-100";
    }
  };



  const getRiskColor = (risk: OverallCancerRisk | RiskLevel | string) => {
    switch (risk) {
      case "low":
        return "text-green-700 bg-green-100 border-green-200";
      case "low_to_moderate":
      case "moderate":
        return "text-orange-700 bg-orange-100 border-orange-200";
      case "high":
        return "text-red-700 bg-red-100 border-red-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getRiskIcon = (risk: OverallCancerRisk | RiskLevel | string) => {
    switch (risk) {
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "low_to_moderate":
      case "moderate":
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const resetAnalyzer = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setProcessing(false);
    setProcessingPhase("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadReport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blood-analysis-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (processing) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Processing Report
          </h2>
          <p className="text-gray-600 mb-8">{processingPhase}</p>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>

          <p className="text-sm text-gray-500">
            {selectedFile?.type === "application/pdf"
              ? "Analyzing PDF document structure..."
              : "Reading image content..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Report Analyzer</h1>
          <p className="text-gray-600">
            AI-powered clinical analysis engine
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Report
        </h2>

        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer?.files?.[0];
              if (file) handleFileSelect(file);
            }}
          >
            <div className="flex justify-center gap-4 mb-4">
              <FileImage className="w-8 h-8 text-gray-400" />
              <div className="h-8 w-[1px] bg-gray-200"></div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag & drop or browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, JPG, PNG up to 15MB
            </p>

            <button className="px-6 cursor-pointer py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              Select File
            </button>

            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-400">
              <p>• High-resolution images work best</p>
              <p>• Text-based PDFs preferred over scanned</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                {selectedFile.type === "application/pdf" ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : (
                  <FileImage className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={analyzeReport}
              disabled={processing}
              className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Brain className="w-5 h-5" />
              Analyze Report
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          className="hidden"
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-red-700">
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-8 animate-in fade-in duration-500">

          {/* Status Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Analysis Complete
              </h2>
              <p className="text-gray-600">Report processed successfully</p>
            </div>
          </div>

          {/* Patient Info & Assessment Grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Patient Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Name</span>
                  <span className="font-medium text-gray-900 text-base">{results.patientInfo?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Age/Gender</span>
                  <span className="font-medium text-gray-900 text-base">
                    {results.patientInfo?.age || "-"}/{results.patientInfo?.gender || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Date</span>
                  <span className="font-medium text-gray-900 text-base">{results.patientInfo?.reportDate || "-"}</span>
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Overall Assessment
              </h3>
              <p className="text-base text-gray-800 leading-relaxed font-medium">
                {results.overallAssessment || "Assessment completed."}
              </p>
            </div>

            {/* Risk Summary */}
            <div className={`p-5 rounded-xl border shadow-sm ${!results.cancerRiskAssessment?.overallRisk || results.cancerRiskAssessment.overallRisk === "low"
              ? "bg-green-50 border-green-200 text-green-900"
              : getRiskColor(results.cancerRiskAssessment.overallRisk)
              }`}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">
                Cancer Risk Profile
              </h3>

              <div className="flex items-center gap-3 mb-2">
                {(!results.cancerRiskAssessment?.overallRisk || results.cancerRiskAssessment.overallRisk === "low") ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  getRiskIcon(results.cancerRiskAssessment.overallRisk)
                )}
                <span className="text-lg font-bold">
                  {results.cancerRiskAssessment?.overallRisk && results.cancerRiskAssessment.overallRisk !== "unable_to_determine"
                    ? String(results.cancerRiskAssessment.overallRisk).replace(/_/g, ' ').toUpperCase()
                    : "NO IMMEDIATE RISK DETECTED"}
                </span>
              </div>
              <p className="text-sm mt-2 opacity-90">
                {results.cancerRiskAssessment?.overallRisk === "low" || !results.cancerRiskAssessment?.overallRisk
                  ? "No tumor markers or specific cancer indicators were found in this report."
                  : "Please review the detailed risk factors below."}
              </p>
            </div>
          </div>

          {/* Test Results Table */}
          {results.testResults && results.testResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">
                  Detailed Test Results
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {results.testResults.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="p-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      {category.category || "General Tests"}
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Test Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Value</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm hidden sm:table-cell">Reference</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {category.tests?.map((test, testIndex) => (
                            <tr key={testIndex} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4 font-medium text-gray-900 text-base">{test.testName}</td>
                              <td className="py-3 px-4 font-mono text-gray-700 text-base">{String(test.value)} <span className="text-gray-400 text-sm">{test.unit}</span></td>
                              <td className="py-3 px-4 text-gray-500 text-base hidden sm:table-cell">{test.referenceRange || "-"}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(test.status)}`}>
                                  {test.status === 'normal' || test.status === 'low' || test.status === 'high' || test.status === 'critical'
                                    ? null
                                    : <Activity className="w-3 h-3" />}
                                  {test.status ? test.status.toUpperCase() : "UNKNOWN"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Risk Analysis */}
          {results.cancerRiskAssessment && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-red-50/50">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Detailed Risk Factors</h3>
              </div>

              <div className="p-6 grid md:grid-cols-2 gap-8">
                {/* Risk Factors */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">Identified Risk Factors</h4>
                  {results.cancerRiskAssessment.riskFactors?.length ? (
                    <ul className="space-y-4">
                      {results.cancerRiskAssessment.riskFactors.map((factor, idx) => (
                        <li key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900">{factor.factor}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${getRiskColor(factor.riskLevel)}`}>
                              {factor.riskLevel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{factor.significance}</p>
                          <div className="text-sm text-gray-500 mt-2 font-mono">Value: {factor.value}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No specific risk factors identified.</p>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 border-b pb-2">AI Recommendations</h4>
                  {results.cancerRiskAssessment.recommendations?.length ? (
                    <ul className="space-y-3">
                      {results.cancerRiskAssessment.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No specific recommendations.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4 pb-8">
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
            {reportId && (
              <button
                onClick={() => router.push(`/dashboard/report/${reportId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-900 font-medium transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                View Full Report
              </button>
            )}
            <button
              onClick={resetAnalyzer}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              Analyze New Report
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
