// src/app/dashboard/blood-analyzer/page.tsx
"use client";

import React, { useState, useRef } from "react";
import {
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
import { motion, AnimatePresence } from "motion/react";

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
      <motion.div
        className="p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 text-center max-w-2xl mx-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin" />
          </motion.div>
          <motion.h2
            className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Processing Your Report
          </motion.h2>
          <motion.p
            className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {processingPhase}
          </motion.p>
          <motion.div
            className="w-full bg-gray-200 rounded-full h-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: "66%" }}
              initial={{ width: 0 }}
              animate={{ width: "66%" }}
              transition={{ delay: 0.7, duration: 1 }}
            />
          </motion.div>
          <motion.p
            className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {selectedFile?.type === "application/pdf"
              ? "PDF processing may take 60–90 seconds"
              : "OCR processing may take 30–60 seconds"}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-8 space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-3 sm:gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div
          className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        </motion.div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blood Report Analyzer</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Upload your blood test report for AI-powered analysis
          </p>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Upload Blood Report
        </h2>

        {!selectedFile ? (
          <motion.div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="flex justify-center gap-3 sm:gap-4 mb-3 sm:mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            >
              <FileImage className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-400">or</span>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </motion.div>
            <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
              Drop your blood report here or click to browse
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
              JPG, PNG, PDF • Max 10MB (images), 15MB (PDF)
            </p>
            <motion.div
              className="text-xs sm:text-sm text-gray-400 bg-gray-50 p-3 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
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
            </motion.div>
            <motion.button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-3 sm:mt-4 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Select File
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {selectedFile.type === "application/pdf" ? (
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                ) : (
                  <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                )}
              </motion.div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                  {selectedFile.type === "application/pdf"
                    ? "PDF Document"
                    : "Image File"}
                </p>
              </div>
              <motion.button
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-gray-200 rounded"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <motion.button
              onClick={analyzeReport}
              disabled={processing}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              whileHover={{ scale: processing ? 1 : 1.05 }}
              whileTap={{ scale: processing ? 1 : 0.95 }}
            >
              <Brain className="w-5 h-5" />
              Analyze Report
            </motion.button>
          </motion.div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
          className="hidden"
        />

        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 font-medium text-sm sm:text-base">Analysis Failed</p>
                <div className="text-red-600 text-xs sm:text-sm mt-1 whitespace-pre-line">
                  {error}
                </div>
                {(error.includes("scanned") || error.includes("image-based")) && (
                  <motion.div
                    className="mt-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">
                      💡 Suggested Solution:
                    </p>
                    <p className="text-blue-600 text-xs sm:text-sm mt-1">
                      Take a clear photo of your blood report and upload it as JPG
                      or PNG instead.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <motion.div
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div
                className="flex items-center gap-3 mb-4 sm:mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                >
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </motion.div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Analysis Complete
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">Report processed successfully</p>
                </div>
              </motion.div>

              {/* Patient Info */}
              <motion.div
                className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="bg-blue-50 p-3 sm:p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-sm sm:text-base font-medium text-blue-900 mb-2 sm:mb-3">
                    Patient Information
                  </h3>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-xs sm:text-sm">
                      <span className="text-blue-700 font-medium">Name:</span>{" "}
                      {results.patientInfo?.name ?? "Not specified"}
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span className="text-blue-700 font-medium">Age:</span>{" "}
                      {results.patientInfo?.age ?? "Not specified"}
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span className="text-blue-700 font-medium">Gender:</span>{" "}
                      {results.patientInfo?.gender ?? "Not specified"}
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span className="text-blue-700 font-medium">Date:</span>{" "}
                      {results.patientInfo?.reportDate ?? "Not specified"}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-green-50 p-3 sm:p-4 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-sm sm:text-base font-medium text-green-900 mb-2 sm:mb-3">
                    Overall Assessment
                  </h3>
                  <p className="text-xs sm:text-sm text-green-800">
                    {results.overallAssessment || "Assessment completed"}
                  </p>
                </motion.div>

                <motion.div
                  className={`p-3 sm:p-4 rounded-lg border ${
                    results.cancerRiskAssessment?.overallRisk
                      ? getRiskColor(results.cancerRiskAssessment.overallRisk)
                      : "bg-gray-50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-sm sm:text-base font-medium mb-2 sm:mb-3">Cancer Risk Assessment</h3>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    {results.cancerRiskAssessment?.overallRisk &&
                      getRiskIcon(results.cancerRiskAssessment.overallRisk)}
                    <span className="text-xs sm:text-sm font-semibold">
                      {results.cancerRiskAssessment?.overallRisk
                        ? String(
                            results.cancerRiskAssessment.overallRisk
                          ).toUpperCase()
                        : "UNABLE TO DETERMINE"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm">
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
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Test Results */}
            {results.testResults && results.testResults.length > 0 && (
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Test Results
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">
                  {results.testResults.map((category, categoryIndex) => (
                    <motion.div
                      key={categoryIndex}
                      className="p-3 sm:p-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + categoryIndex * 0.1 }}
                    >
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
                        {category.category || "Tests"}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Test
                              </th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Value
                              </th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                                Reference
                              </th>
                              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {category.tests?.map((test, testIndex) => (
                              <motion.tr
                                key={testIndex}
                                className="hover:bg-gray-50"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + testIndex * 0.05 }}
                              >
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                                  {test.testName}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                  {String(test.value)} {test.unit}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                                  {test.referenceRange || "Not provided"}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    {getStatusIcon(test.status)}
                                    <span
                                      className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                        test.status
                                      )}`}
                                    >
                                      <span className="hidden sm:inline">
                                        {test.status
                                          .charAt(0)
                                          .toUpperCase() + test.status.slice(1)}
                                      </span>
                                      <span className="sm:hidden">
                                        {test.status.charAt(0).toUpperCase()}
                                      </span>
                                    </span>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
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
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <motion.button
                onClick={downloadReport}
                className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Report</span>
                <span className="sm:hidden">Download</span>
              </motion.button>
              <motion.button
                onClick={resetAnalyzer}
                className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Analyze Another Report</span>
                <span className="sm:hidden">New Analysis</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
