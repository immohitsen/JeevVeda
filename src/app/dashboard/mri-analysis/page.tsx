"use client"

import { useState, useRef } from "react"
import { Upload, Brain, AlertTriangle, CheckCircle, ArrowLeft, FileImage, X, Loader2, Download, Eye, ChevronRight, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PredictionResult {
  prediction: string
  confidence: number
  reportId?: string
}

export default function MRIAnalysisPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setError(null)
      setResult(null)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setError(null)
      setResult(null)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch("/api/mri-predict", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`)
      }

      const data: PredictionResult = await res.json()
      setResult(data)
    } catch (error) {
      console.error('Full error:', error)
      if (error instanceof Error) {
        setError(`Error: ${error.message}`)
      } else {
        setError("Error connecting to backend.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6 font-sans text-slate-900">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MRI Analysis</h1>
            <p className="text-slate-500 text-sm mt-0.5">AI-Powered Cancer Detection</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Upload */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Upload Scan</h3>
            </div>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-slate-50/50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileImage className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <h4 className="text-lg font-semibold text-slate-700 mb-1">Click to upload or drag and drop</h4>
                <p className="text-slate-400 text-sm mb-6">Supports JPG, PNG, DICOM (Max 10MB)</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <button
                    onClick={removeFile}
                    className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-base shadow-sm shadow-blue-200 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" /> Start Analysis
                    </>
                  )}
                </Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Guidelines Panel (Static) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Scanning Guidelines
            </h3>
            <ul className="space-y-3">
              {[
                "Ensure the MRI image is clear and high-resolution.",
                "Avoid images with glare or excessive noise.",
                "Supported formats: .jpg, .png."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">{i + 1}</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", result.prediction.toLowerCase() === 'cancer' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600')}>
                  {result.prediction.toLowerCase() === 'cancer' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">Analysis Result</h3>
              </div>

              <div className={cn("p-6 rounded-xl border mb-6 text-center", result.prediction.toLowerCase() === 'cancer' ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100')}>
                <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-slate-500">Prediction</p>
                <h2 className={cn("text-3xl font-bold mb-4", result.prediction.toLowerCase() === 'cancer' ? 'text-red-700' : 'text-emerald-700')}>
                  {result.prediction.toLowerCase() === 'cancer' ? 'Potential Abnormality' : 'No Abnormality Detected'}
                </h2>
                <div className="inline-flex items-center px-4 py-1.5 bg-white rounded-full border shadow-sm">
                  <span className="text-sm font-medium text-slate-600">Confidence: </span>
                  <span className="ml-2 text-sm font-bold text-slate-900">{(result.confidence).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {/* I'll download functionality later */}
                {/* <Button variant="outline" className="w-full justify-start h-12 border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Download className="w-4 h-4 mr-3 text-slate-400" /> Download Report PDF
                </Button> */}
                <Button
                  onClick={() => result.reportId && router.push(`/dashboard/report/${result.reportId}`)}
                  disabled={!result.reportId}
                  variant="outline"
                  className="w-full justify-start h-12 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="w-4 h-4 mr-3 text-slate-400" /> View Report
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Disclaimer: This AI analysis is a screening tool and not a substitute for professional medical diagnosis. Please consult a specialist for confirmation.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Brain className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Ready for Analysis</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Upload an MRI scan to generate a preliminary AI assessment report.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
