"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Upload, FileImage, X, ArrowLeft, ZoomIn, ZoomOut, Move, ChevronLeft, ChevronRight, Play, Pause, Ruler, Sun, Moon, Settings, Menu, FolderOpen, ChevronUp, ChevronDown } from "lucide-react"
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
  const [_measurements, setMeasurements] = useState<{ x: number; y: number }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Sidebar/Drawer states
  const [showRightSidebar, setShowRightSidebar] = useState(true)
  const [showFileDrawer, setShowFileDrawer] = useState(true) // Open by default

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playbackRef = useRef<NodeJS.Timeout | null>(null)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // On mobile, collapse right sidebar by default
      if (window.innerWidth < 1024) {
        setShowRightSidebar(false)
      } else {
        setShowRightSidebar(true)
      }
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        setWindowCenter(imageData.windowCenter || 517)
        setWindowWidth(imageData.windowWidth || 1102)
        setBrightness(0)
        setContrast(1)
        setMeasurements([])

        // Auto-close drawer on mobile when file is loaded to show image
        if (window.innerWidth < 1024) {
          setShowFileDrawer(false)
        }
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
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCanvas.width = dicomData.width
      tempCanvas.height = dicomData.height

      const frame = dicomData.frames[currentFrame]
      const pixelData = frame.pixelData
      const imageData = tempCtx.createImageData(dicomData.width, dicomData.height)
      const data = imageData.data

      const wc = windowCenter !== null ? windowCenter : (dicomData.windowCenter || 128)
      const ww = windowWidth !== null ? windowWidth : (dicomData.windowWidth || 256)

      if (pixelData instanceof Uint16Array) {
        const windowMin = wc - ww / 2
        const windowMax = wc + ww / 2

        for (let i = 0; i < pixelData.length && i < dicomData.width * dicomData.height; i++) {
          let pixelValue = pixelData[i]
          if (pixelValue <= windowMin) {
            pixelValue = 0
          } else if (pixelValue >= windowMax) {
            pixelValue = 255
          } else {
            pixelValue = Math.round(((pixelValue - windowMin) / ww) * 255)
          }
          pixelValue = Math.max(0, Math.min(255, pixelValue * contrast + brightness))

          const canvasIndex = i * 4
          data[canvasIndex] = pixelValue
          data[canvasIndex + 1] = pixelValue
          data[canvasIndex + 2] = pixelValue
          data[canvasIndex + 3] = 255
        }
      } else {
        for (let i = 0; i < pixelData.length && i < dicomData.width * dicomData.height; i++) {
          let pixelValue = pixelData[i]
          pixelValue = Math.max(0, Math.min(255, pixelValue * contrast + brightness))
          const canvasIndex = i * 4
          data[canvasIndex] = pixelValue
          data[canvasIndex + 1] = pixelValue
          data[canvasIndex + 2] = pixelValue
          data[canvasIndex + 3] = 255
        }
      }

      tempCtx.putImageData(imageData, 0, 0)

      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        canvasRef.current.width = dicomData.width
        canvasRef.current.height = dicomData.height
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
    if (dicomData) {
      // Fix: Ensure we don't go past the last frame
      setCurrentFrame(prev => Math.min(prev + 1, dicomData.numberOfFrames - 1))
    }
  }, [dicomData])

  const prevFrame = useCallback(() => {
    // Fix: Ensure we don't go below 0
    setCurrentFrame(prev => Math.max(0, prev - 1))
  }, [])

  const goToFrame = (frameIndex: number) => {
    if (dicomData && frameIndex >= 0 && frameIndex < dicomData.numberOfFrames) {
      setCurrentFrame(frameIndex)
    }
  }

  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 40 })
    setBrightness(0)
    setContrast(1)
    if (dicomData) {
      setWindowCenter(dicomData.windowCenter || 517)
      setWindowWidth(dicomData.windowWidth || 1102)
    }
    if (containerRef.current && dicomData) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const availableWidth = containerRect.width - 40
      const availableHeight = containerRect.height - 40

      const fit = DicomParser.fitImageToContainer(
        dicomData.width,
        dicomData.height,
        availableWidth,
        availableHeight
      )

      setZoom(fit.scale * 0.95)
    } else {
      setZoom(1)
    }
  }, [dicomData])

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

  useEffect(() => {
    if (isPlaying && dicomData && dicomData.numberOfFrames > 1) {
      playbackRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const next = prev + 1
          // Loop playback
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

  useEffect(() => {
    if (dicomData) {
      renderDicomFrame()
    }
  }, [dicomData, currentFrame, windowCenter, windowWidth, brightness, contrast, renderDicomFrame])

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

      const target = e.target as HTMLElement
      const canvas = canvasRef.current
      const container = containerRef.current

      if (canvas && container && (canvas.contains(target) || container.contains(target))) {
        e.preventDefault()
        if (e.deltaY > 0) nextFrame()
        else if (e.deltaY < 0) prevFrame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [dicomData, currentFrame, isPlaying, nextFrame, prevFrame, togglePlayback, resetView])

  useEffect(() => {
    if (dicomData && containerRef.current) {
      setTimeout(() => resetView(), 100)
      const handleResize = () => {
        if (containerRef.current) resetView()
      }
      setTimeout(() => resetView(), 500)
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [dicomData, resetView])

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] bg-black lg:rounded-xl overflow-hidden shadow-2xl lg:border border-gray-800 relative select-none">

      {/* Top Header / Toolbar */}
      <div className="bg-gray-950 text-white px-4 py-2 flex items-center justify-between border-b border-gray-800 z-30 relative shrink-0 h-14">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileDrawer(!showFileDrawer)}
            className={`gap-2 transition-colors ${showFileDrawer ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {showFileDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span className="font-medium text-sm">
              {selectedFile ? selectedFile.name : 'Select File'}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">{uploadedFiles.length} file(s)</span>
          <Button variant="ghost" size="sm" onClick={() => setShowRightSidebar(!showRightSidebar)} className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Top Drawer - Content limited height */}
      <div className={`
         absolute top-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 transition-all duration-300 ease-in-out shadow-2xl
         ${showFileDrawer ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
      `} style={{ maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Upload Area - COMPACT */}
          <div className="grid gap-3">
            {!selectedFile && uploadedFiles.length === 0 && (
              <div
                className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-800 hover:border-gray-700"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                <p className="text-gray-400 text-xs mb-2">Drop DICOM files</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => document.getElementById('drawer-file-upload')?.click()}
                  className="bg-gray-800 text-gray-200 hover:bg-gray-700 h-7 text-xs"
                >
                  Browse Files
                </Button>
              </div>
            )}
            <input
              type="file"
              multiple
              accept=".dcm,.dicom"
              onChange={handleFileInput}
              className="hidden"
              id="drawer-file-upload"
            />

            {/* File List Horizontal/Grid */}
            {uploadedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded Files</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-blue-400 hover:text-blue-300 px-2"
                    onClick={() => document.getElementById('drawer-file-upload')?.click()}
                  >
                    + Add File
                  </Button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all ${selectedFile === file
                        ? "border-blue-500/50 bg-blue-500/10 text-white"
                        : "border-gray-800 bg-gray-900/50 hover:bg-gray-800 text-gray-300"
                        }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <FileImage className={`w-4 h-4 shrink-0 ${selectedFile === file ? 'text-blue-400' : 'text-gray-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-[10px] opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-400 hover:bg-transparent"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Drag Handle to close */}
        <div
          className="h-5 w-full flex items-center justify-center cursor-pointer hover:bg-white/5 border-t border-gray-800 shrink-0"
          onClick={() => setShowFileDrawer(false)}
        >
          <div className="w-10 h-1 bg-gray-700 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Canvas Area */}
        <div className="flex-1 bg-black relative overflow-hidden flex flex-col" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center text-white">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-400 p-4">
                <X className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm">{error}</p>
              </div>
            ) : dicomData ? (
              <div className="relative flex items-center justify-center w-full h-full" style={{ overflow: 'hidden' }}>
                <div style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <canvas
                    ref={canvasRef}
                    className={`shadow-lg ${activeTool === 'pan' ? 'cursor-move' : activeTool === 'measure' ? 'cursor-crosshair' : 'cursor-default'}`}
                    style={{
                      imageRendering: 'pixelated',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FileImage className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm opacity-50">Select a DICOM file from top menu</p>
              </div>
            )}

            {/* Context Overlays (Frames, etc) */}
            {dicomData && dicomData.numberOfFrames > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full flex items-center gap-4 z-10 border border-gray-800 backdrop-blur-sm">
                <Button variant="ghost" size="icon" onClick={prevFrame} className="h-8 w-8 text-white hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-white text-xs whitespace-nowrap">{currentFrame + 1} / {dicomData.numberOfFrames}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={togglePlayback} className="h-8 w-8 text-white hover:bg-white/10">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={nextFrame} className="h-8 w-8 text-white hover:bg-white/10">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Scroll Indicator (Vertical) */}
            {dicomData && dicomData.numberOfFrames > 1 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full py-2 px-1 z-10 hidden lg:flex flex-col items-center">
                <div className="w-1 bg-gray-700 rounded-full h-32 relative">
                  <div
                    className="w-full bg-blue-500 rounded-full absolute transition-all duration-150"
                    style={{
                      height: `${(1 / dicomData.numberOfFrames) * 100}%`,
                      top: `${(currentFrame / dicomData.numberOfFrames) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Tools */}
        <div className={`
             absolute inset-y-0 right-0 z-20 w-72 bg-gray-900 border-l border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
             lg:relative lg:translate-x-0
             ${showRightSidebar ? 'translate-x-0' : 'translate-x-full shadow-none pointer-events-none opacity-0 lg:opacity-100 lg:pointer-events-auto'}
        `}>
          {selectedFile ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-medium text-sm truncate w-40">{selectedFile.name}</h3>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowRightSidebar(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Tools */}
                <div>
                  <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Tools</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={activeTool === 'pan' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool(activeTool === 'pan' ? 'none' : 'pan')} className="justify-start bg-gray-800 border-gray-600 hover:bg-gray-700 h-8 text-xs">
                      <Move className="w-3 h-3 mr-2" /> Pan
                    </Button>
                    <Button variant={activeTool === 'measure' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTool(activeTool === 'measure' ? 'none' : 'measure')} className="justify-start bg-gray-800 border-gray-600 hover:bg-gray-700 h-8 text-xs">
                      <Ruler className="w-3 h-3 mr-2" /> Measure
                    </Button>
                  </div>
                </div>

                {/* Zoom */}
                <div>
                  <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Zoom</h4>
                  <div className="flex gap-2 mb-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="flex-1 bg-gray-800 border-gray-600 h-8"><ZoomOut className="w-3 h-3" /></Button>
                    <div className="flex items-center justify-center bg-gray-800 rounded px-3 min-w-[3rem] text-sm text-white">{Math.round(zoom * 100)}%</div>
                    <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="flex-1 bg-gray-800 border-gray-600 h-8"><ZoomIn className="w-3 h-3" /></Button>
                  </div>
                  <Button variant="secondary" size="sm" onClick={resetView} className="w-full text-xs h-8">Reset View</Button>
                </div>

                {/* Image Adjustments */}
                {dicomData && (
                  <div>
                    <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Display</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400"><span>Width ({windowWidth})</span></div>
                        <input type="range" min="1" max="3000" value={windowWidth || 1102} onChange={(e) => setWindowWidth(parseInt(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400"><span>Level ({windowCenter})</span></div>
                        <input type="range" min="-1000" max="1000" value={windowCenter || 517} onChange={(e) => setWindowCenter(parseInt(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400"><div className="flex items-center gap-1"><Sun className="w-3 h-3" /> Brightness</div></div>
                        <input type="range" min="-100" max="100" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400"><div className="flex items-center gap-1"><Moon className="w-3 h-3" /> Contrast</div></div>
                        <input type="range" min="0.1" max="3" step="0.1" value={contrast} onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-2">
                        {Object.keys(windowPresets).slice(0, 4).map((preset) => (
                          <Button key={preset} variant="outline" size="sm" onClick={() => applyWindowPreset(preset as any)} className="text-[10px] h-6 bg-gray-800 border-gray-600">
                            {preset}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center">
              <Settings className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Select a file to view properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}