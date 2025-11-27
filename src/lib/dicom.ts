import * as dicomParser from 'dicom-parser'

export interface DicomImageData {
  imageId: string
  width: number
  height: number
  frames: DicomFrame[]
  windowCenter?: number
  windowWidth?: number
  patientName?: string
  studyDescription?: string
  seriesDescription?: string
  instanceNumber?: string
  imageType?: string
  numberOfFrames: number
}

export interface DicomFrame {
  pixelData: Uint8Array | Uint16Array
  frameNumber: number
}

export class DicomParser {
  static async parseFile(file: File): Promise<DicomImageData | null> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const byteArray = new Uint8Array(arrayBuffer)
      
      // Parse DICOM file
      const dataSet = dicomParser.parseDicom(byteArray)
      
      // Extract image dimensions
      const width = dataSet.uint16('x00280011') // Columns
      const height = dataSet.uint16('x00280010') // Rows
      const bitsAllocated = dataSet.uint16('x00280100') // Bits Allocated
      // const pixelRepresentation = dataSet.uint16('x00280103') // Pixel Representation (currently unused)
      
      if (!width || !height) {
        throw new Error('Invalid DICOM file: missing image dimensions')
      }
      
      // Extract number of frames
      const numberOfFrames = dataSet.uint16('x00280008') || 1 // Number of Frames
      const samplesPerPixel = dataSet.uint16('x00280002') || 1 // Samples per Pixel
      
      // Extract pixel data
      const pixelDataElement = dataSet.elements.x7fe00010
      if (!pixelDataElement) {
        throw new Error('Invalid DICOM file: no pixel data found')
      }
      
      const pixelDataOffset = pixelDataElement.dataOffset
      const pixelDataLength = pixelDataElement.length
      
      // Calculate frame size more accurately
      const frameSize = width * height * samplesPerPixel
      const bytesPerPixel = bitsAllocated === 16 ? 2 : 1
      const frameSizeInBytes = frameSize * bytesPerPixel
      
      console.log('DICOM Info:', {
        width,
        height,
        numberOfFrames,
        bitsAllocated,
        samplesPerPixel,
        frameSize,
        frameSizeInBytes,
        totalPixelDataLength: pixelDataLength
      })
      
      const frames: DicomFrame[] = []
      
      // Handle both single and multi-frame DICOM files
      if (numberOfFrames === 1) {
        // Single frame - use all pixel data
        let framePixelData: Uint8Array | Uint16Array
        
        if (bitsAllocated === 16) {
          framePixelData = new Uint16Array(
            arrayBuffer.slice(pixelDataOffset, pixelDataOffset + pixelDataLength)
          )
        } else {
          framePixelData = new Uint8Array(
            arrayBuffer.slice(pixelDataOffset, pixelDataOffset + pixelDataLength)
          )
        }
        
        frames.push({
          pixelData: framePixelData,
          frameNumber: 1
        })
      } else {
        // Multi-frame - split pixel data
        const actualFrameCount = Math.floor(pixelDataLength / frameSizeInBytes)
        const finalFrameCount = Math.min(numberOfFrames, actualFrameCount)
        
        console.log('Frame calculation:', {
          expectedFrames: numberOfFrames,
          actualFramesPossible: actualFrameCount,
          finalFrameCount
        })
        
        for (let frameIndex = 0; frameIndex < finalFrameCount; frameIndex++) {
          const frameOffset = pixelDataOffset + (frameIndex * frameSizeInBytes)
          const frameEndOffset = Math.min(frameOffset + frameSizeInBytes, pixelDataOffset + pixelDataLength)
          
          let framePixelData: Uint8Array | Uint16Array
          
          if (bitsAllocated === 16) {
            framePixelData = new Uint16Array(
              arrayBuffer.slice(frameOffset, frameEndOffset)
            )
          } else {
            framePixelData = new Uint8Array(
              arrayBuffer.slice(frameOffset, frameEndOffset)
            )
          }
          
          // Verify frame data size
          const expectedLength = frameSize
          if (framePixelData.length >= expectedLength * 0.9) { // Allow 10% tolerance
            frames.push({
              pixelData: framePixelData,
              frameNumber: frameIndex + 1
            })
          }
        }
      }
      
      // Extract metadata
      const patientName = dataSet.string('x00100010') // Patient Name
      const studyDescription = dataSet.string('x00081030') // Study Description
      const seriesDescription = dataSet.string('x0008103e') // Series Description
      const instanceNumber = dataSet.string('x00200013') // Instance Number
      const imageType = dataSet.string('x00080008') // Image Type
      
      // Extract window/level values
      const windowCenter = dataSet.floatString('x00281050') // Window Center
      const windowWidth = dataSet.floatString('x00281051') // Window Width
      
      const actualNumberOfFrames = frames.length
      console.log('Final frame count:', actualNumberOfFrames)
      
      const imageData: DicomImageData = {
        imageId: `dicom:${file.name}`,
        width,
        height,
        frames,
        numberOfFrames: actualNumberOfFrames,
        windowCenter: windowCenter || undefined,
        windowWidth: windowWidth || undefined,
        patientName,
        studyDescription,
        seriesDescription,
        instanceNumber,
        imageType
      }
      
      return imageData
      
    } catch (error) {
      console.error('Error parsing DICOM file:', error)
      return null
    }
  }
  
  static createFrameCanvas(imageData: DicomImageData, frameIndex: number = 0): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    if (!context) {
      throw new Error('Could not get canvas context')
    }
    
    if (frameIndex >= imageData.frames.length) {
      throw new Error('Frame index out of bounds')
    }
    
    canvas.width = imageData.width
    canvas.height = imageData.height
    
    const frame = imageData.frames[frameIndex]
    const pixelData = frame.pixelData
    
    // Calculate expected pixel count
    const expectedPixelCount = imageData.width * imageData.height
    const actualPixelCount = pixelData.length
    
    console.log('Frame rendering info:', {
      frameIndex,
      expectedPixelCount,
      actualPixelCount,
      width: imageData.width,
      height: imageData.height
    })
    
    // Create image data for canvas
    const canvasImageData = context.createImageData(imageData.width, imageData.height)
    const canvasData = canvasImageData.data
    
    // Convert pixel data to RGBA with better error handling
    if (pixelData instanceof Uint16Array) {
      // 16-bit to 8-bit conversion with improved windowing
      let windowCenter = imageData.windowCenter
      let windowWidth = imageData.windowWidth
      
      // Auto-calculate window/level if not provided
      if (!windowCenter || !windowWidth) {
        let min = pixelData[0]
        let max = pixelData[0]
        
        // Sample every 100th pixel for performance
        for (let i = 0; i < pixelData.length; i += 100) {
          if (pixelData[i] < min) min = pixelData[i]
          if (pixelData[i] > max) max = pixelData[i]
        }
        
        windowCenter = windowCenter || (min + max) / 2
        windowWidth = windowWidth || (max - min)
      }
      
      const windowMin = windowCenter - windowWidth / 2
      const windowMax = windowCenter + windowWidth / 2
      
      for (let i = 0; i < Math.min(pixelData.length, expectedPixelCount); i++) {
        let pixelValue = pixelData[i]
        
        // Apply windowing with clamping
        if (pixelValue <= windowMin) {
          pixelValue = 0
        } else if (pixelValue >= windowMax) {
          pixelValue = 255
        } else {
          pixelValue = Math.round(((pixelValue - windowMin) / windowWidth) * 255)
        }
        
        // Clamp to valid range
        pixelValue = Math.max(0, Math.min(255, pixelValue))
        
        const canvasIndex = i * 4
        if (canvasIndex + 3 < canvasData.length) {
          canvasData[canvasIndex] = pixelValue     // Red
          canvasData[canvasIndex + 1] = pixelValue // Green
          canvasData[canvasIndex + 2] = pixelValue // Blue
          canvasData[canvasIndex + 3] = 255        // Alpha
        }
      }
    } else {
      // 8-bit data with bounds checking
      for (let i = 0; i < Math.min(pixelData.length, expectedPixelCount); i++) {
        const pixelValue = Math.max(0, Math.min(255, pixelData[i]))
        const canvasIndex = i * 4
        if (canvasIndex + 3 < canvasData.length) {
          canvasData[canvasIndex] = pixelValue     // Red
          canvasData[canvasIndex + 1] = pixelValue // Green
          canvasData[canvasIndex + 2] = pixelValue // Blue
          canvasData[canvasIndex + 3] = 255        // Alpha
        }
      }
    }
    
    context.putImageData(canvasImageData, 0, 0)
    return canvas
  }
  
  static validateDicomFile(file: File): boolean {
    // Basic validation based on file extension and MIME type
    const validExtensions = ['.dcm', '.dicom', '.ima', '.img']
    const fileName = file.name.toLowerCase()
    
    // Check file extension
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    // Check MIME type (though DICOM files might not have a proper MIME type)
    const hasValidMimeType = file.type.includes('dicom') || file.type === 'application/dicom'
    
    // Check file size (DICOM files are typically larger than 1KB)
    const hasValidSize = file.size > 1024
    
    return hasValidExtension || hasValidMimeType || hasValidSize
  }
  
  static fitImageToContainer(imageWidth: number, imageHeight: number, containerWidth: number, containerHeight: number): { scale: number, offsetX: number, offsetY: number } {
    const scaleX = containerWidth / imageWidth
    const scaleY = containerHeight / imageHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond original size
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    const offsetX = (containerWidth - scaledWidth) / 2
    const offsetY = (containerHeight - scaledHeight) / 2
    
    return { scale, offsetX, offsetY }
  }
}