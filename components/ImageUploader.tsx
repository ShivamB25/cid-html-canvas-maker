'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import CanvasDisplay from './CanvasDisplay'
import { generateCanvasCodeFromImageData } from '@/lib/canvas-code-generator'
import type { RectangleCommand } from '@/lib/canvas-code-generator'

type GenerationStats = {
  rectangles: number
  width: number
  height: number
}

export default function ImageUploader() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [generatedRectangles, setGeneratedRectangles] = useState<RectangleCommand[] | null>(null)
  const [generationStats, setGenerationStats] = useState<GenerationStats | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const copyTimeoutRef = useRef<number | null>(null)

  const resetGeneratedOutput = useCallback(() => {
    setGeneratedCode(null)
    setGenerationStats(null)
    setGeneratedRectangles(null)
    setGenerationError(null)
    setCopyFeedback(null)
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = null
    }
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      resetGeneratedOutput()
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }, [resetGeneratedOutput])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleDownload = () => {
    if (!canvasRef.current || !imageFile) return

    // Convert canvas to blob and download
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = imageFile.name || 'canvas-image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      },
      imageFile.type,
      0.95
    )
  }

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setImageFile(null)
    setImageUrl(null)
    resetGeneratedOutput()
  }

  const handleGenerateCode = () => {
    if (!canvasRef.current) {
      setGenerationError('Canvas not ready yet, please wait for the image to load.')
      return
    }

    try {
      setIsGeneratingCode(true)
      setGenerationError(null)
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) {
        throw new Error('Unable to access Canvas 2D context.')
      }

      const { width, height } = canvasRef.current
      if (!width || !height) {
        throw new Error('Canvas is empty. Draw an image before generating code.')
      }

      const imageData = ctx.getImageData(0, 0, width, height)
      const result = generateCanvasCodeFromImageData(imageData)
      setGeneratedCode(result.code)
      setGeneratedRectangles(result.rectangles)
      setGenerationStats({
        rectangles: result.rectangleCount,
        width: result.width,
        height: result.height
      })
    } catch (error) {
      console.error('Failed to generate canvas code', error)
      const message = error instanceof Error ? error.message : 'Failed to generate Canvas code.'
      setGenerationError(message)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleCopyCode = async () => {
    if (!generatedCode) return
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API is not available in this browser.')
      }
      await navigator.clipboard.writeText(generatedCode)
      setCopyFeedback('Code copied to clipboard')
    } catch (error) {
      console.error('Unable to copy code', error)
      setCopyFeedback('Copy failed. Please select and copy manually.')
    }

    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyFeedback(null)
      copyTimeoutRef.current = null
    }, 2000)
  }

  const handleDownloadCode = () => {
    if (!generatedCode) return
    const baseName = imageFile?.name?.replace(/\.[^/.]+$/, '') || 'canvas-image'
    const blob = new Blob([generatedCode], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${baseName}-canvas-code.js`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current)
      }
      if (imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  useEffect(() => {
    if (!previewCanvasRef.current || !generatedRectangles || !generationStats) return
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = generationStats.width
    canvas.height = generationStats.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const rect of generatedRectangles) {
      ctx.fillStyle = rect.fillStyle
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    }
  }, [generatedRectangles, generationStats])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
              </p>
              <p className="text-sm mt-2">or click to select a file</p>
              <p className="text-xs mt-2 text-gray-500">
                Supports JPG, PNG, and WebP
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <CanvasDisplay imageUrl={imageUrl} canvasRef={canvasRef} />

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Choose Different Image
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Image
            </button>
            <button
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isGeneratingCode
                  ? 'bg-purple-400 text-white cursor-wait'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7l-4-4-4 4m4-4v18"
                />
              </svg>
              {isGeneratingCode ? 'Generating…' : 'Generate Canvas Code'}
            </button>
          </div>

          {generationError && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {generationError}
            </p>
          )}

          {generatedCode && generationStats && (
            <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p>
                    Canvas size: {generationStats.width} × {generationStats.height}px
                  </p>
                  <p>Rectangles used: {generationStats.rectangles}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Copy code
                  </button>
                  <button
                    onClick={handleDownloadCode}
                    className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800"
                  >
                    Download JS
                  </button>
                </div>
              </div>
              {copyFeedback && (
                <p className="text-xs text-green-600 dark:text-green-400">{copyFeedback}</p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <pre className="max-h-96 overflow-auto rounded-md bg-gray-900 text-green-200 text-xs p-4">
                  <code>{generatedCode}</code>
                </pre>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Generated code preview
                  </p>
                  <canvas
                    ref={previewCanvasRef}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    style={{ minHeight: 200 }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This canvas is rendered by replaying the parsed `fillStyle`/`fillRect` commands from the generated code.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
