"use client"

import { useState, useRef } from "react"
import {
    Upload, AlertTriangle, CheckCircle, ArrowLeft,
    FileImage, X, Loader2, Eye, Shield, Microscope,
    Activity, Info
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OSCCResult {
    class: string
    confidence: number
    probabilities: {
        Normal: number
        OSCC: number
    }
    reportId?: string
}

const isOSCC = (result: OSCCResult) =>
    result.class?.toLowerCase().includes("oscc")

export default function OSCCAnalyzerPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<OSCCResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file (JPG, PNG, WEBP)")
            return
        }
        if (file.size > 15 * 1024 * 1024) {
            setError("File size must be less than 15MB")
            return
        }
        setSelectedFile(file)
        setError(null)
        setResult(null)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processFile(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) processFile(file)
    }

    const removeFile = () => {
        setSelectedFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        setResult(null)
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const analyzeImage = async () => {
        if (!selectedFile) return
        setLoading(true)
        setError(null)
        const formData = new FormData()
        formData.append("file", selectedFile)
        try {
            const res = await fetch("/api/oscc-predict", { method: "POST", body: formData })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data: OSCCResult = await res.json()
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? `Analysis failed: ${err.message}` : "Could not connect to analysis service.")
        } finally {
            setLoading(false)
        }
    }

    return (
        // Fill the parent container height — no min-h-screen, no overflow
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
                <div className="flex items-center gap-2 min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">OSCC Analyzer</h1>
                    <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold rounded-full whitespace-nowrap">
                        AI-Powered
                    </span>
                </div>
                <p className="text-slate-400 text-sm hidden sm:block whitespace-nowrap ml-1">
                    Oral Squamous Cell Carcinoma Detection
                </p>
            </div>

            {/* ── Main grid — order controls mobile stacking; lg: uses explicit placement ── */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[1fr_auto] gap-4 min-h-0">

                {/* 1 — Upload card: mobile order 1, desktop col 1-7 row 1 */}
                <div className="order-1 lg:col-span-7 lg:row-start-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col min-h-[280px] lg:min-h-0">
                    <div className="flex items-center gap-2 mb-4 shrink-0">
                        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                            <Upload className="w-4 h-4 text-teal-600" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Upload Oral Image</h3>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col">
                        {!selectedFile ? (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
                                    dragOver
                                        ? "border-teal-400 bg-teal-50/60 scale-[1.01]"
                                        : "border-slate-200 hover:border-teal-400 hover:bg-slate-50/50"
                                )}
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all",
                                    dragOver ? "bg-teal-100 scale-110" : "bg-slate-50 group-hover:scale-110"
                                )}>
                                    <FileImage className={cn(
                                        "w-7 h-7 transition-colors",
                                        dragOver ? "text-teal-500" : "text-slate-400 group-hover:text-teal-500"
                                    )} />
                                </div>
                                <p className="text-base font-semibold text-slate-700 mb-1">
                                    {dragOver ? "Drop image here" : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-slate-400 text-xs mb-4">JPG, PNG, WEBP · Max 15MB</p>
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-5 text-sm">
                                    Browse Files
                                </Button>
                            </div>
                        ) : (
                            <div className="flex-1 min-h-0 flex flex-col gap-3">
                                <div className="relative bg-slate-50 rounded-xl border border-slate-200 flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                    <button
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-100"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    {previewUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={previewUrl} alt="Oral image preview" className="max-h-full max-w-full object-contain p-3" />
                                    )}
                                </div>
                                <div className="shrink-0 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <FileImage className="w-4 h-4 text-teal-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-xs truncate">{selectedFile.name}</p>
                                        <p className="text-[11px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <Button
                                        onClick={analyzeImage}
                                        disabled={loading}
                                        size="sm"
                                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 text-sm shrink-0 disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Analyzing…</>
                                        ) : (
                                            <><Microscope className="w-3.5 h-3.5 mr-1.5" />Analyze</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 shrink-0">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-medium">{error}</span>
                        </div>
                    )}
                </div>

                {/* 2 — Results: mobile order 2, desktop col 8-12 row 1-2 (spans both rows) */}
                <div className="order-2 lg:col-start-8 lg:col-span-5 lg:row-start-1 lg:row-span-2 flex flex-col min-h-0">
                    {result ? (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-full min-h-0">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 shrink-0">
                                <div className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                    isOSCC(result) ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {isOSCC(result) ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Analysis Result</h3>
                                    <p className="text-[11px] text-slate-400">Oral Cancer Classifier v1</p>
                                </div>
                            </div>
                            <div className={cn(
                                "p-4 rounded-xl border text-center mb-4 shrink-0",
                                isOSCC(result) ? "bg-red-50/60 border-red-100" : "bg-emerald-50/60 border-emerald-100"
                            )}>
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-slate-400">Detected Class</p>
                                <h2 className={cn("text-2xl font-extrabold tracking-tight mb-1", isOSCC(result) ? "text-red-700" : "text-emerald-700")}>
                                    {isOSCC(result) ? "OSCC Detected" : "Normal Tissue"}
                                </h2>
                                <p className={cn("text-xs mb-3 font-medium", isOSCC(result) ? "text-red-500" : "text-emerald-500")}>
                                    {isOSCC(result) ? "Oral Squamous Cell Carcinoma" : "No abnormality detected"}
                                </p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border shadow-sm">
                                    <Activity className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600">Confidence</span>
                                    <span className="text-xs font-bold text-slate-900">{(result.confidence * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="space-y-3 mb-4 flex-1 min-h-0">
                                <p className="text-xs font-semibold text-slate-600">Class Probabilities</p>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Normal</span>
                                        <span className="font-bold text-emerald-700">{((result.probabilities?.Normal ?? 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${((result.probabilities?.Normal ?? 0) * 100).toFixed(1)}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-600 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />OSCC</span>
                                        <span className="font-bold text-red-700">{((result.probabilities?.OSCC ?? 0) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${((result.probabilities?.OSCC ?? 0) * 100).toFixed(1)}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 shrink-0">
                                <Button onClick={() => result.reportId && router.push(`/dashboard/report/${result.reportId}`)} disabled={!result.reportId} variant="outline" className="w-full justify-start h-10 border-slate-200 text-slate-700 hover:bg-slate-50 text-sm">
                                    <Eye className="w-4 h-4 mr-2 text-slate-400" />View Full Report
                                </Button>
                                <Button onClick={removeFile} variant="ghost" className="w-full justify-start h-10 text-slate-400 hover:text-slate-700 text-sm">
                                    <Upload className="w-4 h-4 mr-2" />Analyze Another Image
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center text-center min-h-[200px] lg:min-h-0">
                            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                                <Microscope className="w-8 h-8 text-teal-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">Awaiting Image</h3>
                            <p className="text-slate-400 text-sm max-w-[200px]">Upload an oral cavity image to begin AI-powered OSCC detection.</p>
                        </div>
                    )}
                </div>

                {/* 3 — Info strip: mobile order 3 (last), desktop col 1-7 row 2 */}
                <div className="order-3 lg:col-span-7 lg:row-start-2 grid grid-cols-1 sm:grid-cols-2 gap-4 self-end">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
                        <p className="text-s font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-teal-500" />Imaging Guidelines
                        </p>
                        <ul className="space-y-1.5">
                            {["Well-lit, high-resolution oral cavity photo", "Clearly capture the lesion or suspicious area", "Avoid blurry images or heavy shadows"].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                                    <span className="w-4 h-4 bg-teal-50 rounded-full flex items-center justify-center text-[10px] font-bold text-teal-600 shrink-0 mt-0.5">{i + 1}</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
                        <p className="text-s font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-teal-500" />About OSCC
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Oral Squamous Cell Carcinoma (OSCC) is one of the most common head &amp; neck cancers.
                            Early detection dramatically improves survival. This tool uses a deep-learning model for preliminary screening.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
