// src/app/dashboard/blood-analyzer/page.tsx
"use client";

import { useState, useRef } from "react";
import {
  FileImage, FileText, X, Brain, CheckCircle, AlertTriangle,
  Activity, Loader2, ArrowLeft, Upload, Eye, Shield,
  Info, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ───────────────────────── Types ───────────────────────── */
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

interface CancerRiskAssessment {
  overallRisk: OverallCancerRisk;
  riskFactors: CancerRiskFactor[];
  cancerTypes: { type: string; riskLevel: RiskLevel; indicators: string[] }[];
  recommendations: string[];
}

interface BloodAnalysisResults {
  patientInfo?: PatientInfo;
  overallAssessment?: string;
  testResults?: TestCategory[];
  cancerRiskAssessment?: CancerRiskAssessment;
  otherHealthRisks?: { condition: string; risk: RiskLevel; indicators: string[]; description: string }[];
  insights?: string[];
}

/* ───────────────────────── Helpers ─────────────────────── */
const statusStyle = (s: TestStatus | string) => {
  switch (s) {
    case "normal": return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "high": return "text-orange-700 bg-orange-50 border-orange-200";
    case "low": return "text-blue-700 bg-blue-50 border-blue-200";
    case "critical": return "text-red-700 bg-red-50 border-red-200";
    default: return "text-slate-600 bg-slate-100 border-slate-200";
  }
};

const riskStyle = (r: string) => {
  switch (r) {
    case "low": return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "low_to_moderate":
    case "moderate": return "text-orange-700 bg-orange-50 border-orange-200";
    case "high": return "text-red-700 bg-red-50 border-red-200";
    default: return "text-slate-600 bg-slate-100 border-slate-200";
  }
};

const riskLabel = (r: string) =>
  r === "unable_to_determine" ? "No Risk Detected" : r.replace(/_/g, " ").toUpperCase();

/* ───────────────────────── Component ───────────────────── */
export default function BloodAnalyzerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BloodAnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingPhase, setProcessingPhase] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    const valid = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!valid.includes(file.type)) { setError("Only JPG, PNG, PDF files are allowed"); return; }
    const maxSize = file.type === "application/pdf" ? 15 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) { setError(`File size must be less than ${file.type === "application/pdf" ? "15MB" : "10MB"}`); return; }
    setSelectedFile(file);
    setError(null);
    setResults(null);
    setReportId(null);
  };

  const analyzeReport = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    setError(null);

    const phases = selectedFile.type === "application/pdf"
      ? ["Extracting text from PDF…", "Analyzing medical data…", "Generating insights…"]
      : ["Performing OCR on image…", "Analyzing medical data…", "Generating insights…"];

    let phaseIndex = 0;
    setProcessingPhase(phases[0]);
    const iv = setInterval(() => {
      phaseIndex++;
      if (phaseIndex < phases.length) setProcessingPhase(phases[phaseIndex]);
    }, 3000);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("/api/blood-analyzer", { method: "POST", body: formData });
      const data = await response.json();
      clearInterval(iv);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Analysis failed. Please try again with a clearer file.");
      }
      setResults(data.data as BloodAnalysisResults);
      if (data.reportId) setReportId(data.reportId);
    } catch (e) {
      clearInterval(iv);
      setError(e instanceof Error ? e.message : "Failed to analyze the report.");
    } finally {
      setProcessing(false);
      setProcessingPhase("");
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setProcessing(false);
    setProcessingPhase("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const overallRisk = results?.cancerRiskAssessment?.overallRisk;
  const isLowRisk = !overallRisk || overallRisk === "low" || overallRisk === "unable_to_determine";

  return (
    <div className="h-full flex flex-col p-4 font-sans text-slate-900 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Button
          variant="ghost" size="icon"
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">Blood Analyzer</h1>
          <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full whitespace-nowrap">
            AI-Powered
          </span>
        </div>
        <p className="text-slate-400 text-sm hidden sm:block whitespace-nowrap ml-1">
          Clinical Blood Report Analysis
        </p>
      </div>

      {/* ── Main grid: order controls mobile stacking; lg: uses explicit placement ── */}
      {/* Mobile: order 1 (upload) → order 2 (results) → order 3 (info strip)       */}
      {/* Desktop: col 1-5 row 1 | col 6-12 row 1-2 | col 1-5 row 2                 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[1fr_auto] gap-4 min-h-0">

        {/* 1 — Upload card */}
        <div className="order-1 lg:col-span-5 lg:row-start-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col min-h-[280px] lg:min-h-0">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Upload Blood Report</h3>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer?.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                  dragOver
                    ? "border-rose-400 bg-rose-50/60 scale-[1.01]"
                    : "border-slate-200 hover:border-rose-400 hover:bg-slate-50/50"
                )}
              >
                <div className={cn("flex items-center gap-3 mb-3 transition-all", dragOver ? "scale-110" : "group-hover:scale-110")}>
                  <FileImage className={cn("w-7 h-7 transition-colors", dragOver ? "text-rose-400" : "text-slate-300 group-hover:text-rose-400")} />
                  <div className="h-8 w-px bg-slate-200" />
                  <FileText className={cn("w-7 h-7 transition-colors", dragOver ? "text-rose-400" : "text-slate-300 group-hover:text-rose-400")} />
                </div>
                <p className="text-base font-semibold text-slate-700 mb-1">
                  {dragOver ? "Drop file here" : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-slate-400 mb-4">PDF, JPG, PNG · Images up to 10MB · PDF up to 15MB</p>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-5 text-sm">
                  Select File
                </Button>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col gap-3">
                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center min-h-0 p-4">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                      {selectedFile.type === "application/pdf"
                        ? <FileText className="w-7 h-7 text-rose-500" />
                        : <FileImage className="w-7 h-7 text-rose-500" />
                      }
                    </div>
                    <p className="font-semibold text-slate-800 text-sm mb-1 max-w-[180px] truncate mx-auto">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded-full font-medium border border-rose-100 shrink-0">Ready</span>
                  <div className="flex-1" />
                  <button onClick={reset} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <Button
                    onClick={analyzeReport}
                    disabled={processing}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 text-sm shrink-0 disabled:opacity-70"
                  >
                    {processing ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Analyzing…</>
                    ) : (
                      <><Brain className="w-3.5 h-3.5 mr-1.5" />Analyze</>
                    )}
                  </Button>
                </div>
                {processing && processingPhase && (
                  <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100">
                    <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin shrink-0" />
                    <span className="text-xs text-rose-700 font-medium">{processingPhase}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700 shrink-0">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* 2 — Results panel (spans 2 rows on desktop, order 2 on mobile) */}
        <div className="order-2 lg:col-start-6 lg:col-span-7 lg:row-start-1 lg:row-span-2 flex flex-col min-h-0">
          {!results ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center text-center min-h-[200px] lg:min-h-0">
              {processing ? (
                <>
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Processing Report</h3>
                  <p className="text-slate-400 text-sm max-w-[220px]">{processingPhase}</p>
                  <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-rose-200" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Awaiting Report</h3>
                  <p className="text-slate-400 text-sm max-w-[220px]">
                    Upload a blood report (PDF or image) to get AI-powered clinical insights.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full min-h-0 overflow-hidden">
              {/* Results header */}
              <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Analysis Complete</h3>
                    <p className="text-[11px] text-slate-400">Blood Report · AI Clinical Assessment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reportId && (
                    <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/report/${reportId}`)} className="h-8 text-xs border-slate-200">
                      <Eye className="w-3.5 h-3.5 mr-1.5" />View Report
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={reset} className="h-8 text-xs text-slate-400">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />New
                  </Button>
                </div>
              </div>

              {/* Scrollable results body */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Patient</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{results.patientInfo?.name || "—"}</p>
                    <p className="text-xs text-slate-500">{results.patientInfo?.age || "—"} · {results.patientInfo?.gender || "—"}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{results.patientInfo?.reportDate || "—"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Assessment</p>
                    <p className="text-xs text-slate-700 leading-relaxed line-clamp-4">{results.overallAssessment || "Assessment completed."}</p>
                  </div>
                  <div className={cn("rounded-xl p-3 border", riskStyle(overallRisk ?? "low"))}>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-2 opacity-70">Cancer Risk</p>
                    <div className="flex items-center gap-1.5 mb-1">
                      {isLowRisk ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-orange-600" />}
                      <span className="text-xs font-bold">{riskLabel(overallRisk ?? "low")}</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">{isLowRisk ? "No tumor markers found." : "Review risk factors below."}</p>
                  </div>
                </div>

                {/* Test Results */}
                {results.testResults && results.testResults.length > 0 && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      <h4 className="text-xs font-bold text-slate-700">Detailed Test Results</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {results.testResults.map((category, ci) => (
                        <div key={ci} className="p-3">
                          {category.category && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{category.category}</p>}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Test</th>
                                  <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Value</th>
                                  <th className="text-left py-1.5 px-2 font-semibold text-slate-500 hidden sm:table-cell">Reference</th>
                                  <th className="text-left py-1.5 px-2 font-semibold text-slate-500">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {category.tests?.map((test, ti) => (
                                  <tr key={ti} className="hover:bg-slate-50/50">
                                    <td className="py-1.5 px-2 font-medium text-slate-800">{test.testName}</td>
                                    <td className="py-1.5 px-2 font-mono text-slate-700">
                                      {String(test.value)} <span className="text-slate-400">{test.unit}</span>
                                    </td>
                                    <td className="py-1.5 px-2 text-slate-400 hidden sm:table-cell">{test.referenceRange || "—"}</td>
                                    <td className="py-1.5 px-2">
                                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border", statusStyle(test.status))}>
                                        {(test.status || "unknown").toUpperCase()}
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

                {/* Risk Factors & Recommendations */}
                {results.cancerRiskAssessment && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 bg-red-50/60 border-b border-slate-200 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <h4 className="text-xs font-bold text-slate-700">Risk Factors</h4>
                      </div>
                      <div className="p-3 space-y-2">
                        {results.cancerRiskAssessment.riskFactors?.length ? (
                          results.cancerRiskAssessment.riskFactors.map((f, i) => (
                            <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex justify-between items-start gap-1 mb-0.5">
                                <span className="text-xs font-semibold text-slate-800">{f.factor}</span>
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold border shrink-0", riskStyle(f.riskLevel))}>{f.riskLevel}</span>
                              </div>
                              <p className="text-[11px] text-slate-500">{f.significance}</p>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">Value: {f.value}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic text-center py-4">No specific risk factors identified.</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 bg-emerald-50/60 border-b border-slate-200 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-700">AI Recommendations</h4>
                      </div>
                      <div className="p-3 space-y-2">
                        {results.cancerRiskAssessment.recommendations?.length ? (
                          results.cancerRiskAssessment.recommendations.map((rec, i) => (
                            <div key={i} className="flex gap-2 text-xs text-slate-600">
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic text-center py-4">No specific recommendations.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3 — Info strip: mobile order 3 (LAST), desktop col 1-5 row 2 */}
        <div className="order-3 lg:col-span-5 lg:row-start-2 grid grid-cols-1 sm:grid-cols-2 gap-4 self-end">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-500" />Upload Tips
            </p>
            <ul className="space-y-1.5">
              {["High-resolution scans work best", "Text-based PDFs preferred over scanned", "Include all pages of your report"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                  <span className="w-4 h-4 bg-rose-50 rounded-full flex items-center justify-center text-[10px] font-bold text-rose-600 shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-rose-500" />About This Tool
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Powered by Gemini AI, this tool parses blood reports and highlights abnormal values,
              cancer risk indicators, and health recommendations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
