"use client"

import { useState, useRef } from "react"
import { Upload, Brain, AlertTriangle, CheckCircle, ArrowLeft, FileImage, X, Loader2, Download, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface PredictionResult {
  prediction: string
  confidence: number
  probabilities: {
    Cancer: number
    Normal: number
  }
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      setResult(null)

      // Create preview URL
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      setResult(null)

      // Create preview URL
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
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data: PredictionResult = await res.json()
      setResult(data)
    } catch (error) {
      console.error(error)
      setError("Error connecting to backend. Please ensure the server is running.")
    } finally {
      setLoading(false)
    }
  }

  const getResultColor = (prediction: string) => {
    return prediction.toLowerCase() === 'cancer' ? 'red' : 'green'
  }

  const formatConfidence = (confidence: number) => {
    return confidence.toFixed(2)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MRI Cancer Analysis</h1>
          <p className="text-base leading-relaxed text-gray-600">
            Upload an MRI image for AI-powered cancer detection analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Upload MRI Image</h2>
            </div>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your MRI image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports: JPG, PNG, DICOM • Max size: 10MB
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Select File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="relative bg-gray-50 rounded-lg p-4">
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="MRI Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileImage className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Analyze for Cancer
                    </>
                  )}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Preview</h3>
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="MRI Preview"
                  className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  getResultColor(result.prediction) === 'red' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {getResultColor(result.prediction) === 'red' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
              </div>

              {/* Main Prediction */}
              <div className="mb-6">
                <div className={`p-4 rounded-lg border-2 ${
                  getResultColor(result.prediction) === 'red' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prediction</p>
                      <p className={`text-2xl font-bold ${
                        getResultColor(result.prediction) === 'red' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {result.prediction}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">Confidence</p>
                      <p className={`text-2xl font-bold ${
                        getResultColor(result.prediction) === 'red' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {formatConfidence(result.confidence)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Probabilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Probabilities</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-medium text-red-900">Cancer</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-red-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities.Cancer}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-red-700 w-12 text-right">
                        {formatConfidence(result.probabilities.Cancer)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-900">Normal</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${result.probabilities.Normal}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-green-700 w-12 text-right">
                        {formatConfidence(result.probabilities.Normal)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Share Results
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">Medical Disclaimer</p>
                    <p className="text-sm text-yellow-700">
                      This AI analysis is for screening purposes only and should not replace professional medical diagnosis. 
                      Please consult with a qualified healthcare provider for proper medical evaluation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for Analysis</h3>
                <p className="text-gray-600">
                  Upload an MRI image to get started with AI-powered cancer detection
                </p>
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">How it Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-blue-800">Upload a high-quality MRI image in JPG or PNG format</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-blue-800">Our AI model analyzes the image for potential cancer indicators</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-blue-800">Get detailed results with confidence scores and recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
