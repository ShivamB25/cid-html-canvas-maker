'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
  ReactNode,
  CSSProperties
} from 'react'
import { useDropzone } from 'react-dropzone'
import CanvasDisplay from './CanvasDisplay'
import {
  generateCanvasCodeFromImageData,
  type GenerateCanvasCodeOptions,
  type RectangleCommand
} from '@/lib/canvas-code-generator'

type GeneratorMode = NonNullable<GenerateCanvasCodeOptions['mode']>

type GeneratorSettings = {
  colorBuckets: number
  blurRadius: number
  alphaThreshold: number
  mode: GeneratorMode
  quadtreeTolerance: number
  quadtreeMinSize: number
}

type GenerationStats = {
  rectangles: number
  width: number
  height: number
  codeBytes: number
}

type PaletteEntry = {
  color: string
  percent: number
  area: number
}

const DEFAULT_SETTINGS: GeneratorSettings = {
  colorBuckets: 96,
  blurRadius: 1,
  alphaThreshold: 0.02,
  mode: 'scanline',
  quadtreeTolerance: 18,
  quadtreeMinSize: 2
}

const PRESETS: Record<
  'lineart' | 'balanced' | 'photo',
  { label: string; description: string; settings: GeneratorSettings }
> = {
  lineart: {
    label: 'Line Art',
    description: 'Aggressive merging, best for sketches and logos.',
    settings: {
      colorBuckets: 24,
      blurRadius: 0,
      alphaThreshold: 0.01,
      mode: 'quadtree',
      quadtreeTolerance: 10,
      quadtreeMinSize: 1
    }
  },
  balanced: {
    label: 'Balanced',
    description: 'Good compromise for handwriting or UI screenshots.',
    settings: {
      colorBuckets: 64,
      blurRadius: 1,
      alphaThreshold: 0.02,
      mode: 'scanline',
      quadtreeTolerance: 16,
      quadtreeMinSize: 2
    }
  },
  photo: {
    label: 'Photo',
    description: 'Preserves gradients for photos/texture references.',
    settings: {
      colorBuckets: 160,
      blurRadius: 2,
      alphaThreshold: 0.03,
      mode: 'quadtree',
      quadtreeTolerance: 28,
      quadtreeMinSize: 3
    }
  }
}

const MODE_LABELS: Record<GeneratorMode, string> = {
  scanline: 'Scanline (fast)',
  quadtree: 'Quadtree (blocky compression)'
}

const TOP_PALETTE_COLORS = 6

type WorkerResponse = {
  id: number
  result?: ReturnType<typeof generateCanvasCodeFromImageData>
  error?: string
}

const hiddenFileInputStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  clipPath: 'inset(50%)',
  border: 0,
  whiteSpace: 'nowrap'
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
  const [generatorSettings, setGeneratorSettings] = useState<GeneratorSettings>(DEFAULT_SETTINGS)
  const [appliedSettings, setAppliedSettings] = useState<GeneratorSettings | null>(null)
  const [activePreset, setActivePreset] = useState<keyof typeof PRESETS | null>(null)
  const [paletteSummary, setPaletteSummary] = useState<PaletteEntry[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const copyTimeoutRef = useRef<number | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const pendingRequestRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)
  const pendingSettingsRef = useRef<GeneratorSettings | null>(null)

  const resetGeneratedOutput = useCallback(() => {
    setGeneratedCode(null)
    setGenerationStats(null)
    setGeneratedRectangles(null)
    setGenerationError(null)
    setCopyFeedback(null)
    setAppliedSettings(null)
    setPaletteSummary([])
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = null
    }
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        resetGeneratedOutput()
        setImageFile(file)
        const url = URL.createObjectURL(file)
        setImageUrl(url)
      }
    },
    [resetGeneratedOutput]
  )

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

  const finalizeGeneration = useCallback(
    (result: ReturnType<typeof generateCanvasCodeFromImageData>, settings: GeneratorSettings | null) => {
      setGeneratedCode(result.code)
      setGeneratedRectangles(result.rectangles)
      const codeBytes = new Blob([result.code]).size
      setGenerationStats({
        rectangles: result.rectangleCount,
        width: result.width,
        height: result.height,
        codeBytes
      })
      setPaletteSummary(buildPaletteSummary(result.rectangles, TOP_PALETTE_COLORS))
      if (settings) {
        setAppliedSettings(settings)
      }
      setGenerationError(null)
    },
    []
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    let worker: Worker | null = null
    try {
      worker = new Worker(new URL('../lib/workers/code-generator.worker.ts', import.meta.url))
      workerRef.current = worker
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id !== pendingRequestRef.current) return
        pendingRequestRef.current = null
        setIsGeneratingCode(false)
        if (event.data.error || !event.data.result) {
          setGenerationError(event.data.error ?? 'Failed to generate Canvas code.')
          return
        }
        finalizeGeneration(event.data.result, pendingSettingsRef.current)
      }
    } catch (error) {
      console.warn('Falling back to main-thread generation', error)
    }

    return () => {
      worker?.terminate()
      workerRef.current = null
      pendingRequestRef.current = null
    }
  }, [finalizeGeneration])

  const handleDownload = () => {
    if (!canvasRef.current || !imageFile) return

    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return

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

  const runGeneration = async (imageData: ImageData, settings: GeneratorSettings) => {
    setIsGeneratingCode(true)
    setGenerationError(null)
    const requestId = ++requestIdRef.current
    pendingRequestRef.current = requestId
    pendingSettingsRef.current = settings

    if (workerRef.current) {
      workerRef.current.postMessage({
        id: requestId,
        imageData,
        options: settings
      })
      return
    }

    try {
      const result = generateCanvasCodeFromImageData(imageData, settings)
      if (pendingRequestRef.current !== requestId) return
      pendingRequestRef.current = null
      setIsGeneratingCode(false)
      finalizeGeneration(result, settings)
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate Canvas code.')
      setIsGeneratingCode(false)
    }
  }

  const handleGenerateCode = () => {
    if (!canvasRef.current) {
      setGenerationError('Canvas not ready yet, please wait for the image to load.')
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      setGenerationError('Unable to access Canvas 2D context.')
      return
    }

    const { width, height } = canvasRef.current
    if (!width || !height) {
      setGenerationError('Canvas is empty. Draw an image before generating code.')
      return
    }

    const imageData = ctx.getImageData(0, 0, width, height)
    runGeneration(imageData, generatorSettings)
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
    downloadTextFile(`${baseName}-canvas-code.js`, generatedCode, 'text/javascript')
  }

  const handleDownloadHtml = () => {
    if (!generatedCode) return
    const doc = buildHtmlPreview(generatedCode)
    const baseName = imageFile?.name?.replace(/\.[^/.]+$/, '') || 'canvas-image'
    downloadTextFile(`${baseName}-preview.html`, doc, 'text/html')
  }

  const handleDownloadSvg = () => {
    if (!generatedRectangles || !generationStats) return
    const svg = buildSvgFromRectangles(generatedRectangles, generationStats.width, generationStats.height)
    const baseName = imageFile?.name?.replace(/\.[^/.]+$/, '') || 'canvas-image'
    downloadTextFile(`${baseName}-preview.svg`, svg, 'image/svg+xml')
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

  const handleSettingChange = (key: keyof GeneratorSettings) => (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setActivePreset(null)
    const value = key === 'alphaThreshold' ? parseFloat(event.target.value) : parseInt(event.target.value, 10)

    setGeneratorSettings((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleModeChange = (mode: GeneratorMode) => {
    setActivePreset(null)
    setGeneratorSettings((prev) => ({ ...prev, mode }))
  }

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    setActivePreset(presetKey)
    setGeneratorSettings(PRESETS[presetKey].settings)
  }

  const paletteSwatches = useMemo(
    () =>
      paletteSummary.map((entry) => (
        <div key={entry.color} className="flex items-center gap-3 text-sm">
          <span
            className="inline-block h-6 w-6 rounded border border-gray-300 dark:border-gray-700"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-mono">{entry.color}</span>
          <span className="text-gray-500 dark:text-gray-400">{entry.percent.toFixed(1)}%</span>
        </div>
      )),
    [paletteSummary]
  )

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
          <input {...getInputProps({ style: hiddenFileInputStyle })} />
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

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-50">Code generation settings</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pick a preset or fine-tune the knobs, then click Generate Canvas Code.
                </p>
              </div>
              {appliedSettings && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last applied: {appliedSettings.colorBuckets} buckets · blur {appliedSettings.blurRadius}px · alpha ≥{' '}
                  {appliedSettings.alphaThreshold.toFixed(2)} · {appliedSettings.mode}
                </p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof PRESETS)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    activePreset === key
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                  }`}
                >
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{preset.description}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(MODE_LABELS) as Array<GeneratorMode>).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                    generatorSettings.mode === mode
                      ? 'border-purple-500 text-purple-600 dark:text-purple-300'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {MODE_LABELS[mode]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <SettingSlider
                label={`Color buckets per channel: ${generatorSettings.colorBuckets}`}
                helper="Lower bucket counts merge colors for smaller outputs; higher counts preserve gradients."
                min={4}
                max={256}
                step={4}
                value={generatorSettings.colorBuckets}
                onChange={handleSettingChange('colorBuckets')}
              />

              <SettingSlider
                label={`Noise reduction (blur radius): ${generatorSettings.blurRadius}px`}
                helper="Applies a subtle box blur before sampling to smooth paper grain or compression artifacts."
                min={0}
                max={3}
                step={1}
                value={generatorSettings.blurRadius}
                onChange={handleSettingChange('blurRadius')}
              />

              <SettingSlider
                label={`Alpha threshold: ${generatorSettings.alphaThreshold.toFixed(2)}`}
                helper="Pixels below this opacity are skipped entirely, helpful for removing faint highlights."
                min={0}
                max={0.2}
                step={0.01}
                value={generatorSettings.alphaThreshold}
                onChange={handleSettingChange('alphaThreshold')}
              />

              {generatorSettings.mode === 'quadtree' && (
                <>
                  <SettingSlider
                    label={`Quadtree tolerance: ${generatorSettings.quadtreeTolerance}`}
                    helper="Higher tolerance merges larger regions even if colors differ slightly."
                    min={4}
                    max={64}
                    step={1}
                    value={generatorSettings.quadtreeTolerance}
                    onChange={handleSettingChange('quadtreeTolerance')}
                  />
                  <SettingSlider
                    label={`Minimum block size: ${generatorSettings.quadtreeMinSize}px`}
                    helper="Stops the subdivision once blocks reach this size."
                    min={1}
                    max={8}
                    step={1}
                    value={generatorSettings.quadtreeMinSize}
                    onChange={handleSettingChange('quadtreeMinSize')}
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <PrimaryButton onClick={handleReset} variant="ghost">
              Choose Different Image
            </PrimaryButton>
            <PrimaryButton onClick={handleDownload} variant="secondary">
              Download Image
            </PrimaryButton>
            <PrimaryButton onClick={handleGenerateCode} disabled={isGeneratingCode}>
              {isGeneratingCode ? 'Generating…' : 'Generate Canvas Code'}
            </PrimaryButton>
          </div>

          {generationError && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {generationError}
            </p>
          )}

          {generatedCode && generationStats && (
            <div className="space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p>
                    Canvas size: {generationStats.width} × {generationStats.height}px
                  </p>
                  <p>Rectangles used: {generationStats.rectangles.toLocaleString()}</p>
                  <p>Code size: {(generationStats.codeBytes / 1024).toFixed(1)} KB</p>
                  {appliedSettings && (
                    <p>
                      Settings: {appliedSettings.colorBuckets} buckets · blur {appliedSettings.blurRadius}px · alpha ≥{' '}
                      {appliedSettings.alphaThreshold.toFixed(2)} · {appliedSettings.mode}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton onClick={handleCopyCode} variant="outline">
                    Copy code
                  </PrimaryButton>
                  <PrimaryButton onClick={handleDownloadCode} variant="solid">
                    Download JS
                  </PrimaryButton>
                  <PrimaryButton onClick={handleDownloadHtml} variant="solid">
                    Download HTML
                  </PrimaryButton>
                  <PrimaryButton onClick={handleDownloadSvg} variant="solid">
                    Download SVG
                  </PrimaryButton>
                </div>
              </div>
              {copyFeedback && (
                <p className="text-xs text-green-600 dark:text-green-400">{copyFeedback}</p>
              )}
              {!!paletteSummary.length && (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Dominant colors
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {paletteSwatches}
                  </div>
                </div>
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
                    This canvas replays the parsed `fillStyle`/`fillRect` commands from the generated code.
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

function SettingSlider({
  label,
  helper,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string
  helper: string
  min: number
  max: number
  step: number
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
      <span className="text-xs text-gray-500 dark:text-gray-400">{helper}</span>
    </label>
  )
}

function PrimaryButton({
  children,
  onClick,
  variant = 'solid',
  disabled
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'solid' | 'secondary' | 'outline' | 'ghost'
  disabled?: boolean
}) {
  const base = 'px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm'
  const styleMap: Record<'solid' | 'secondary' | 'outline' | 'ghost', string> = {
    solid: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
    ghost: 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
  }
  const variantKey: 'solid' | 'secondary' | 'outline' | 'ghost' = variant ?? 'solid'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styleMap[variantKey]} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function buildPaletteSummary(rectangles: RectangleCommand[], topN: number): PaletteEntry[] {
  const totals = new Map<string, number>()
  let totalArea = 0

  for (const rect of rectangles) {
    const area = rect.width * rect.height
    totalArea += area
    totals.set(rect.fillStyle, (totals.get(rect.fillStyle) ?? 0) + area)
  }

  if (totalArea === 0) {
    return []
  }

  return Array.from(totals.entries())
    .map(([color, area]) => ({ color, area, percent: (area / totalArea) * 100 }))
    .sort((a, b) => b.area - a.area)
    .slice(0, topN)
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function buildHtmlPreview(code: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Canvas Code Preview</title>
<style>
  body { font-family: system-ui, sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#0f172a; }
</style>
</head>
<body>
<script>
${code}
</script>
</body>
</html>`
}

function buildSvgFromRectangles(rectangles: RectangleCommand[], width: number, height: number): string {
  const rects = rectangles
    .map((rect) => `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${rect.fillStyle}" />`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${rects}
</svg>`
}
