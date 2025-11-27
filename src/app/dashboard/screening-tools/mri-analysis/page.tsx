"use client"

import { useState, useRef } from "react"
import { Upload, Brain, AlertTriangle, CheckCircle, ArrowLeft, FileImage, X, Loader2, Download, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"

interface PredictionResult {
  prediction: string
  confidence: number
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
      console.log('Sending request to API...')
      console.log('File:', selectedFile.name, selectedFile.type, selectedFile.size)

      const res = await fetch("/api/mri-predict", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      })

      console.log('Response status:', res.status)
      console.log('Response headers:', res.headers)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`)
      }

      const data: PredictionResult = await res.json()
      console.log('Received data:', data)
      setResult(data)
    } catch (error) {
      console.error('Full error:', error)
      if (error instanceof Error) {
        setError(`Error: ${error.message}`)
      } else {
        setError("Error connecting to backend. Please ensure the server is running and CORS is enabled.")
      }
    } finally {
      setLoading(false)
    }
  }

  const getResultColor = (prediction: string) => {
    return prediction.toLowerCase() === 'cancer' ? 'red' : 'green'
  }

  return (
    <motion.div
      className="p-4 sm:p-8 space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-6 sm:mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">MRI Cancer Analysis</h1>
          <p className="text-sm sm:text-base leading-relaxed text-gray-600">
            Upload an MRI image for AI-powered cancer detection analysis
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Upload Section */}
        <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </motion.div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Upload MRI Image</h2>
            </div>

            {!selectedFile ? (
              <motion.div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                >
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                </motion.div>
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                  Drop your MRI image here, or click to browse
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  Supports: JPG, PNG, DICOM • Max size: 10MB
                </p>
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                {/* File Preview */}
                <motion.div
                  className="relative bg-gray-50 rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.button
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </motion.button>
                  
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="MRI Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileImage className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Analyze Button */}
                <motion.button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="btn-primary w-full"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
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
                </motion.button>
              </motion.div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <motion.div
                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Image Preview */}
          <AnimatePresence>
            {previewUrl && (
              <motion.div
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Image Preview</h3>
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={previewUrl}
                    alt="MRI Preview"
                    className="w-full h-48 sm:h-64 object-contain bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  />
                  <motion.button
                    className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Section */}
        <motion.div
          className="space-y-4 sm:space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                key="results"
              >
                <motion.div
                  className="flex items-center gap-3 mb-4 sm:mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      getResultColor(result.prediction) === 'red' ? 'bg-red-100' : 'bg-green-100'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    {getResultColor(result.prediction) === 'red' ? (
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </motion.div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Analysis Results</h2>
                </motion.div>

                {/* Main Prediction */}
                <motion.div
                  className="mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className={`p-6 sm:p-8 rounded-lg border-2 text-center ${
                    getResultColor(result.prediction) === 'red'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-sm sm:text-base font-medium text-gray-600 mb-2">Result</p>
                    <motion.p
                      className={`text-3xl sm:text-4xl font-bold mb-4 ${
                        getResultColor(result.prediction) === 'red' ? 'text-red-700' : 'text-green-700'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                    >
                      {getResultColor(result.prediction) === 'red' ? 'Cancerous' : 'Not Cancerous'}
                    </motion.p>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Confidence Score</p>
                      <motion.p
                        className={`text-2xl sm:text-3xl font-bold ${
                          getResultColor(result.prediction) === 'red' ? 'text-red-700' : 'text-green-700'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                      >
                        {(result.confidence * 100).toFixed(2)}%
                      </motion.p>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <motion.button
                    className="btn-primary flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download Report</span>
                    <span className="sm:hidden">Download</span>
                  </motion.button>
                  <motion.button
                    className="btn-secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="hidden sm:inline">Share Results</span>
                    <span className="sm:hidden">Share</span>
                  </motion.button>
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                  className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-yellow-800 mb-1">Medical Disclaimer</p>
                      <p className="text-xs sm:text-sm text-yellow-700">
                        This AI analysis is for screening purposes only and should not replace professional medical diagnosis.
                        Please consult with a qualified healthcare provider for proper medical evaluation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                key="empty-state"
              >
                <div className="text-center py-8 sm:py-12">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Ready for Analysis</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Upload an MRI image to get started with AI-powered cancer detection
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Information Panel */}
          <motion.div
            className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">How it Works</h3>
            <div className="space-y-2 sm:space-y-3">
              <motion.div
                className="flex items-start gap-2 sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-xs sm:text-sm text-blue-800">Upload a high-quality MRI image in JPG or PNG format</p>
              </motion.div>
              <motion.div
                className="flex items-start gap-2 sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-xs sm:text-sm text-blue-800">Our AI model analyzes the image for potential cancer indicators</p>
              </motion.div>
              <motion.div
                className="flex items-start gap-2 sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-xs sm:text-sm text-blue-800">Get detailed results with confidence scores and recommendations</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
