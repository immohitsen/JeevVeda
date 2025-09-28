"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Upload, FileImage, X, ArrowLeft, ZoomIn, ZoomOut, Move, ChevronLeft, ChevronRight, Play, Pause, Ruler, Sun, Moon, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { DicomParser, DicomImageData } from "@/lib/dicom"

export default function DicomViewerPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dicomData, setDicomData] = useState<DicomImageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed] = useState(500) // ms per frame
  const [windowCenter, setWindowCenter] = useState<number | null>(null)
  const [windowWidth, setWindowWidth] = useState<number | null>(null)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(1)
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'angle' | 'pan'>('none')
  const [_measurements, setMeasurements] = useState<{x: number; y: number}[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      const dicomFiles = files.filter(file => 
        file.name.toLowerCase().includes('.dcm') || 
        file.type.includes('dicom') ||
        file.name.toLowerCase().includes('dicom')
      )
      setUploadedFiles(prev => [...prev, ...dicomFiles])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files)
      const validFiles = files.filter(file => DicomParser.validateDicomFile(file))
      if (validFiles.length !== files.length) {
        setError('Some files were not valid DICOM files and were skipped')
      }
      setUploadedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    if (selectedFile && uploadedFiles[index] === selectedFile) {
      setSelectedFile(null)
      setDicomData(null)
    }
  }

  const loadDicomFile = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setIsPlaying(false)
    
    try {
      const imageData = await DicomParser.parseFile(file)
      if (imageData) {
        setDicomData(imageData)
        setZoom(1)
        setPan({ x: 0, y: 0 })
        setCurrentFrame(0)
        // Set default window/level values (professional medical settings)
        setWindowCenter(imageData.windowCenter || 517)
        setWindowWidth(imageData.windowWidth || 1102)
        setBrightness(0)
        setContrast(1)
        setMeasurements([])
        console.log('Measurements cleared:', _measurements.length)
      } else {
        setError('Failed to parse DICOM file')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    loadDicomFile(file)
  }

  const renderDicomFrame = useCallback(() => {
    if (!dicomData || !canvasRef.current || currentFrame >= dicomData.numberOfFrames) return
    
    try {
      console.log('Rendering frame:', currentFrame + 1, 'of', dicomData.numberOfFrames)
      
      // Create a temporary canvas with custom window/level settings
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return
      
      tempCanvas.width = dicomData.width
      tempCanvas.height = dicomData.height
      
      // Get frame data
      const frame = dicomData.frames[currentFrame]
      const pixelData = frame.pixelData
      
      // Create image data with custom windowing
      const imageData = tempCtx.createImageData(dicomData.width, dicomData.height)
      const data = imageData.data
      
      // Use custom window/level values if set
      const wc = windowCenter !== null ? windowCenter : (dicomData.windowCenter || 128)
      const ww = windowWidth !== null ? windowWidth : (dicomData.windowWidth || 256)
      
      if (pixelData instanceof Uint16Array) {
        const windowMin = wc - ww / 2
        const windowMax = wc + ww / 2
        
        for (let i = 0; i < pixelData.length && i < dicomData.width * dicomData.height; i++) {
          let pixelValue = pixelData[i]
          
          // Apply windowing
          if (pixelValue <= windowMin) {
            pixelValue = 0
          } else if (pixelValue >= windowMax) {
            pixelValue = 255
          } else {
            pixelValue = Math.round(((pixelValue - windowMin) / ww) * 255)
          }
          
          // Apply brightness and contrast
          pixelValue = Math.max(0, Math.min(255, pixelValue * contrast + brightness))
          
          const canvasIndex = i * 4
          data[canvasIndex] = pixelValue     // Red
          data[canvasIndex + 1] = pixelValue // Green
          data[canvasIndex + 2] = pixelValue // Blue
          data[canvasIndex + 3] = 255        // Alpha
        }
      } else {
        for (let i = 0; i < pixelData.length && i < dicomData.width * dicomData.height; i++) {
          let pixelValue = pixelData[i]
          // Apply brightness and contrast
          pixelValue = Math.max(0, Math.min(255, pixelValue * contrast + brightness))
          
          const canvasIndex = i * 4
          data[canvasIndex] = pixelValue     // Red
          data[canvasIndex + 1] = pixelValue // Green
          data[canvasIndex + 2] = pixelValue // Blue
          data[canvasIndex + 3] = 255        // Alpha
        }
      }
      
      tempCtx.putImageData(imageData, 0, 0)
      
      // Draw to main canvas
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        // Set canvas dimensions to match image dimensions
        canvasRef.current.width = dicomData.width
        canvasRef.current.height = dicomData.height
        
        // Disable image smoothing for sharper medical images
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(tempCanvas, 0, 0)
      }
    } catch (err) {
      console.error('Frame render error:', err)
      setError(`Failed to render frame ${currentFrame + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [dicomData, currentFrame, windowCenter, windowWidth, brightness, contrast])
  
  const nextFrame = useCallback(() => {
    if (dicomData && currentFrame < dicomData.numberOfFrames - 1) {
      const newFrame = currentFrame + 1
      console.log('Next frame:', newFrame)
      setCurrentFrame(newFrame)
    }
  }, [dicomData, currentFrame])
  
  const prevFrame = useCallback(() => {
    if (currentFrame > 0) {
      const newFrame = currentFrame - 1
      console.log('Previous frame:', newFrame)
      setCurrentFrame(newFrame)
    }
  }, [currentFrame])
  
  const goToFrame = (frameIndex: number) => {
    if (dicomData && frameIndex >= 0 && frameIndex < dicomData.numberOfFrames) {
      console.log('Go to frame:', frameIndex)
      setCurrentFrame(frameIndex)
    }
  }
  
  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])
  
  const resetView = useCallback(() => {
    // Set a slight upward offset to position the image higher
    setPan({ x: 0, y: 40 })
    setBrightness(0)
    setContrast(1)
    if (dicomData) {
      setWindowCenter(dicomData.windowCenter || 517)
      setWindowWidth(dicomData.windowWidth || 1102)
    }
    if (containerRef.current && dicomData) {
      const containerRect = containerRef.current.getBoundingClientRect()
      // Calculate available space accounting for padding and potential overlays
      const availableWidth = containerRect.width - 80
      const availableHeight = containerRect.height - 80
      
      const fit = DicomParser.fitImageToContainer(
        dicomData.width,
        dicomData.height,
        availableWidth,
        availableHeight
      )
      
      // Apply the calculated scale to ensure image fits properly
      setZoom(fit.scale * 0.95) // Slightly smaller to ensure full visibility
    } else {
      setZoom(1)
    }
  }, [dicomData])
  
  // Window/Level presets for different scan types
  const windowPresets = {
    'Soft Tissue': { center: 50, width: 400 },
    'Lung': { center: -600, width: 1600 },
    'Bone': { center: 400, width: 1800 },
    'Brain': { center: 40, width: 80 },
    'Liver': { center: 30, width: 150 },
    'Default': { center: 517, width: 1102 }
  }
  
  const applyWindowPreset = (preset: keyof typeof windowPresets) => {
    const { center, width } = windowPresets[preset]
    setWindowCenter(center)
    setWindowWidth(width)
  }
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pan') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && activeTool === 'pan') {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle playback
  useEffect(() => {
    if (isPlaying && dicomData && dicomData.numberOfFrames > 1) {
      playbackRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const next = prev + 1
          return next >= dicomData.numberOfFrames ? 0 : next
        })
      }, playbackSpeed)
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
        playbackRef.current = null
      }
    }
    
    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
  }, [isPlaying, dicomData, playbackSpeed])
  
  // Render frame when data or frame changes
  useEffect(() => {
    if (dicomData) {
      renderDicomFrame()
    }
  }, [dicomData, currentFrame, windowCenter, windowWidth, brightness, contrast, renderDicomFrame])
  
  // Keyboard and mouse wheel navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dicomData) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          prevFrame()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextFrame()
          break
        case ' ':
          e.preventDefault()
          togglePlayback()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          resetView()
          break
      }
    }
    
    const handleWheel = (e: WheelEvent) => {
      if (!dicomData || dicomData.numberOfFrames <= 1) return
      
      // Only handle wheel events if the target is within the DICOM viewer area
      const target = e.target as HTMLElement
      const canvas = canvasRef.current
      const container = containerRef.current
      
      if (canvas && container && (canvas.contains(target) || container.contains(target))) {
        e.preventDefault()
        
        if (e.deltaY > 0) {
          // Scroll down - next frame
          nextFrame()
        } else if (e.deltaY < 0) {
          // Scroll up - previous frame
          prevFrame()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [dicomData, currentFrame, isPlaying, nextFrame, prevFrame, togglePlayback, resetView])
  
  // Auto-fit image when loaded or when container size changes
  useEffect(() => {
    if (dicomData && containerRef.current) {
      // Small delay to ensure container is fully rendered
      setTimeout(() => resetView(), 100)
      
      // Add resize listener to handle window/container size changes
      const handleResize = () => {
        if (containerRef.current) resetView()
      }
      
      // Initial fit might need a second attempt for better accuracy
      setTimeout(() => resetView(), 500)
      
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [dicomData, resetView])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Compact Header */}
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-gray-800 p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            <h1 className="text-lg font-bold">DICOM Viewer</h1>
          </div>
          <div className="bg-red-600 px-2 py-1 rounded text-xs font-medium">
            NOT FOR MEDICAL USE
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <div className="text-gray-400">Educational/Reference Only</div>
          <div className="text-gray-300">{uploadedFiles.length} files</div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - File List */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-4">
            <h3 className="text-white font-medium mb-4">Files</h3>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm mb-2">
                Drop DICOM files here
              </p>
              <p className="text-gray-500 text-xs mb-4">
                or click to browse
              </p>
              <input
                type="file"
                multiple
                accept=".dcm,.dicom"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Browse Files
              </Button>
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedFile === file
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs opacity-70">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="text-gray-400 hover:text-red-400 hover:bg-transparent p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Main DICOM Viewer - Fullscreen */}
        <div className="flex-1 bg-black relative overflow-hidden" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading DICOM file...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400">
                <X className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg mb-2">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : dicomData ? (
                             <div 
                 className="relative flex items-start justify-center w-full h-full"
                 style={{
                   overflow: 'hidden',
                   padding: '20px',
                   paddingTop: '60px',
                   paddingBottom: '60px'
                 }}
              >
                <div
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'center center',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    width: '60%',
                    height: '60%',
                    marginTop: '-40px'
                  }}
                >
                  <canvas 
                    ref={canvasRef}
                    className={`shadow-lg ${
                      activeTool === 'pan' ? 'cursor-move' : 
                      activeTool === 'measure' ? 'cursor-crosshair' : 
                      'cursor-default'
                    }`}
                    style={{
                      imageRendering: 'pixelated',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      margin: 'auto'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </div>
              </div>
            ) : selectedFile ? (
              <div className="text-center text-gray-400">
                <FileImage className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Processing...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FileImage className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">No file selected</p>
                <p className="text-sm">Upload and select a DICOM file to view</p>
              </div>
            )}
            
                         {/* Frame Navigation Overlay */}
             {dicomData && dicomData.numberOfFrames > 1 && (
               <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 px-4 py-2 rounded-lg flex items-center gap-3 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevFrame}
                  disabled={currentFrame === 0}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 p-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-2 px-2">
                  <span className="text-white text-sm whitespace-nowrap">
                    {currentFrame + 1} / {dicomData.numberOfFrames}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 p-1"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextFrame}
                  disabled={currentFrame === dicomData.numberOfFrames - 1}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 p-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            
                         {/* Scroll Indicator */}
             {dicomData && dicomData.numberOfFrames > 1 && (
               <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 rounded-lg p-2 z-10">
                <div className="w-2 bg-gray-700 rounded-full" style={{ height: '200px' }}>
                  <div 
                    className="w-full bg-blue-500 rounded-full transition-all duration-150"
                    style={{ 
                      height: `${(currentFrame + 1) / dicomData.numberOfFrames * 100}%`
                    }}
                  ></div>
                </div>
                <div className="text-white text-xs text-center mt-1">
                  {Math.round((currentFrame + 1) / dicomData.numberOfFrames * 100)}%
                </div>
              </div>
            )}
          </div>
        </div>
        
                 {/* Right Sidebar - Settings & Controls */}
         <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-hidden" style={{ maxHeight: '100vh' }}>
          {selectedFile ? (
            <div className="overflow-y-auto h-full" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#4B5563 #1F2937',
                WebkitOverflowScrolling: 'touch'
              }}>
              {/* File Info */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-medium text-sm mb-2 truncate">{selectedFile.name}</h3>
                {dicomData && (
                  <div className="text-gray-400 text-xs space-y-1">
                    <div>{dicomData.width} × {dicomData.height} pixels</div>
                    {dicomData.numberOfFrames > 1 && <div>{dicomData.numberOfFrames} frames</div>}
                    {dicomData.patientName && <div>Patient: {dicomData.patientName}</div>}
                    {dicomData.studyDescription && <div>{dicomData.studyDescription}</div>}
                  </div>
                )}
              </div>
              
              {/* Frame Navigation */}
              {dicomData && dicomData.numberOfFrames > 1 && (
                <div className="p-4 border-b border-gray-700">
                  <h4 className="text-white font-medium text-sm mb-3">Frame Navigation</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevFrame}
                      disabled={currentFrame === 0}
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextFrame}
                      disabled={currentFrame === dicomData.numberOfFrames - 1}
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 flex-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Frame {currentFrame + 1} of {dicomData.numberOfFrames}</span>
                      <span>{Math.round((currentFrame + 1) / dicomData.numberOfFrames * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={dicomData.numberOfFrames - 1}
                      value={currentFrame}
                      onChange={(e) => goToFrame(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
              
              {/* Tools Section */}
              <div className="p-4 border-b border-gray-700">
                <h4 className="text-white font-medium text-sm mb-3">Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={activeTool === 'pan' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool(activeTool === 'pan' ? 'none' : 'pan')}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 justify-start"
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Pan
                  </Button>
                  <Button
                    variant={activeTool === 'measure' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTool(activeTool === 'measure' ? 'none' : 'measure')}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 justify-start"
                  >
                    <Ruler className="w-4 h-4 mr-2" />
                    Measure
                  </Button>
                </div>
              </div>
              
              {/* Zoom Controls */}
              <div className="p-4 border-b border-gray-700">
                <h4 className="text-white font-medium text-sm mb-3">Zoom</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 flex-1"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 flex-1"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-white text-sm mb-2">{Math.round(zoom * 100)}%</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                  className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Reset View
                </Button>
              </div>
              
              {/* Window/Level Controls */}
              {dicomData && (
                <div className="p-4 border-b border-gray-700">
                  <h4 className="text-white font-medium text-sm mb-3">Window/Level</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-gray-400 text-xs w-6">W:</label>
                      <input
                        type="number"
                        value={windowWidth || 1102}
                        onChange={(e) => setWindowWidth(parseInt(e.target.value))}
                        className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 text-white rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-gray-400 text-xs w-6">L:</label>
                      <input
                        type="number"
                        value={windowCenter || 517}
                        onChange={(e) => setWindowCenter(parseInt(e.target.value))}
                        className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 text-white rounded"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-gray-400 text-xs mb-2">Presets:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.keys(windowPresets).map((preset) => (
                          <Button
                            key={preset}
                            variant="outline"
                            size="sm"
                            onClick={() => applyWindowPreset(preset as keyof typeof windowPresets)}
                            className="text-xs bg-gray-800 border-gray-600 text-white hover:bg-gray-700 px-1 py-1"
                          >
                            {preset}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Brightness/Contrast */}
              {dicomData && (
                <div className="p-4 border-b border-gray-700">
                  <h4 className="text-white font-medium text-sm mb-3">Display</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-xs">Brightness</span>
                        </div>
                        <span className="text-gray-400 text-xs">{brightness}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-xs">Contrast</span>
                        </div>
                        <span className="text-gray-400 text-xs">{contrast.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={contrast}
                        onChange={(e) => setContrast(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Keyboard Shortcuts */}
              <div className="p-4">
                <h4 className="text-white font-medium text-sm mb-3">Shortcuts</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>← → Navigate frames</div>
                  <div>Space Play/Pause</div>
                  <div>R Reset view</div>
                  <div>Mouse wheel Scroll frames</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto h-full" style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: '#4B5563 #1F2937',
                WebkitOverflowScrolling: 'touch'
              }}>
              <div className="p-4 text-center text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Select a DICOM file to access settings</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}