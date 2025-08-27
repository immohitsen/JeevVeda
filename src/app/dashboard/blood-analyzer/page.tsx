// src/app/dashboard/blood-analyzer/page.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileImage,
  FileText,
  X,
  Brain,
  CheckCircle,
  Download,
  AlertTriangle,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";

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

type RiskLevel = "low" | "moderate" | "high";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const analyzeReport = async () => {
    if (!selectedFile) return;

    // Preflight: ensure we truly have a Browser File object
    const isValidBrowserFile =
      typeof (selectedFile as any)?.arrayBuffer === "function" &&
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

      // ✅ data.data is the JSON produced by the backend
      setResults(data.data as BloodAnalysisResults);
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

  const getStatusIcon = (status: TestStatus | string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "high":
      case "low":
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: OverallCancerRisk | RiskLevel | string) => {
    switch (risk) {
      case "low":
        return "text-green-700 bg-green-100 border-green-200";
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
      <div className="p-8">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Processing Your Report
          </h2>
          <p className="text-gray-600 mb-6">{processingPhase}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: "66%" }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {selectedFile?.type === "application/pdf"
              ? "PDF processing may take 60–90 seconds"
              : "OCR processing may take 30–60 seconds"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Report Analyzer</h1>
          <p className="text-gray-600">
            Upload your blood test report for AI-powered analysis
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upload Blood Report
        </h2>

        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
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
              <span className="text-gray-400">or</span>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">
              Drop your blood report here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              JPG, PNG, PDF • Max 10MB (images), 15MB (PDF)
            </p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">💡 For best results:</p>
              <p>
                • <strong>Images (JPG/PNG):</strong> Clear, high-resolution photos
                work best
              </p>
              <p>
                • <strong>PDFs:</strong> Text-based PDFs preferred (not scanned
                documents)
              </p>
              <p>• If PDF fails, try uploading as an image instead</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-4">
              Select File
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {selectedFile.type === "application/pdf" ? (
                  <FileText className="w-6 h-6 text-blue-600" />
                ) : (
                  <FileImage className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                  {selectedFile.type === "application/pdf"
                    ? "PDF Document"
                    : "Image File"}
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={analyzeReport}
              disabled={processing}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Analysis Failed</p>
              <div className="text-red-600 text-sm mt-1 whitespace-pre-line">
                {error}
              </div>
              {(error.includes("scanned") || error.includes("image-based")) && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-700 text-sm font-medium">
                    💡 Suggested Solution:
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Take a clear photo of your blood report and upload it as JPG
                    or PNG instead.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Analysis Complete
                </h2>
                <p className="text-gray-600">Report processed successfully</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-3">
                  Patient Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-blue-700">Name:</span>{" "}
                    {results.patientInfo?.name ?? "Not specified"}
                  </p>
                  <p>
                    <span className="text-blue-700">Age:</span>{" "}
                    {results.patientInfo?.age ?? "Not specified"}
                  </p>
                  <p>
                    <span className="text-blue-700">Gender:</span>{" "}
                    {results.patientInfo?.gender ?? "Not specified"}
                  </p>
                  <p>
                    <span className="text-blue-700">Date:</span>{" "}
                    {results.patientInfo?.reportDate ?? "Not specified"}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-3">
                  Overall Assessment
                </h3>
                <p className="text-sm text-green-800">
                  {results.overallAssessment || "Assessment completed"}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  results.cancerRiskAssessment?.overallRisk
                    ? getRiskColor(results.cancerRiskAssessment.overallRisk)
                    : "bg-gray-50"
                }`}
              >
                <h3 className="font-medium mb-3">Cancer Risk Assessment</h3>
                <div className="flex items-center gap-2 mb-2">
                  {results.cancerRiskAssessment?.overallRisk &&
                    getRiskIcon(results.cancerRiskAssessment.overallRisk)}
                  <span className="text-sm font-semibold">
                    {results.cancerRiskAssessment?.overallRisk
                      ? String(
                          results.cancerRiskAssessment.overallRisk
                        ).toUpperCase()
                      : "UNABLE TO DETERMINE"}
                  </span>
                </div>
                <p className="text-sm">
                  {results.cancerRiskAssessment?.overallRisk === "low" &&
                    "Blood parameters show minimal cancer risk indicators"}
                  {results.cancerRiskAssessment?.overallRisk === "moderate" &&
                    "Some parameters warrant monitoring and follow-up"}
                  {results.cancerRiskAssessment?.overallRisk === "high" &&
                    "Multiple risk indicators present - consultation recommended"}
                  {results.cancerRiskAssessment?.overallRisk ===
                    "unable_to_determine" &&
                    "Insufficient data for accurate cancer risk assessment"}
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {results.testResults && results.testResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Test Results
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {results.testResults.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      {category.category || "Tests"}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Test
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Value
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Reference
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {category.tests?.map((test, testIndex) => (
                            <tr key={testIndex} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {test.testName}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {String(test.value)} {test.unit}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {test.referenceRange || "Not provided"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(test.status)}
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                      test.status
                                    )}`}
                                  >
                                    {test.status
                                      .charAt(0)
                                      .toUpperCase() + test.status.slice(1)}
                                  </span>
                                </div>
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

          {/* Cancer Risk Assessment Details */}
          {results.cancerRiskAssessment && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Detailed Cancer Risk Assessment
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Cancer Types */}
                {results.cancerRiskAssessment.cancerTypes?.length ? (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                      Cancer Type Risks
                    </h4>
                    <div className="grid gap-4">
                      {results.cancerRiskAssessment.cancerTypes.map(
                        (cancer, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${getRiskColor(
                              cancer.riskLevel
                            )}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {getRiskIcon(cancer.riskLevel)}
                              <h5 className="font-medium">{cancer.type}</h5>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(
                                  cancer.riskLevel
                                )}`}
                              >
                                {cancer.riskLevel.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm">
                              <strong>Indicators:</strong>{" "}
                              {cancer.indicators.join(", ")}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Risk Factors */}
                {results.cancerRiskAssessment.riskFactors?.length ? (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                      Risk Factors
                    </h4>
                    <div className="space-y-3">
                      {results.cancerRiskAssessment.riskFactors.map(
                        (factor, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${getRiskColor(
                              factor.riskLevel
                            )}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {getRiskIcon(factor.riskLevel)}
                              <strong className="text-sm">
                                {factor.factor}:
                              </strong>
                              <span className="text-sm">{factor.value}</span>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(
                                  factor.riskLevel
                                )}`}
                              >
                                {factor.riskLevel.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">
                              {factor.significance}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Recommendations */}
                {results.cancerRiskAssessment.recommendations?.length ? (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {results.cancerRiskAssessment.recommendations.map(
                        (rec, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{rec}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Other Health Risks */}
          {results.otherHealthRisks?.length ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Other Health Risk Assessment
                </h3>
              </div>

              <div className="p-6">
                <div className="grid gap-4">
                  {results.otherHealthRisks.map((risk, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getRiskColor(
                        risk.risk
                      )}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getRiskIcon(risk.risk)}
                        <h4 className="font-medium">{risk.condition}</h4>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(
                            risk.risk
                          )}`}
                        >
                          {risk.risk.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {risk.description}
                      </p>
                      <div className="text-sm">
                        <strong>Key indicators:</strong>{" "}
                        {risk.indicators.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* AI Insights */}
          {results.insights?.length ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Insights
                </h3>
              </div>
              <div className="space-y-3">
                {results.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={downloadReport}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={resetAnalyzer}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Analyze Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
