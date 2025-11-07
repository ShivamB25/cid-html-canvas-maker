/// <reference lib="webworker" />

import { generateCanvasCodeFromImageData, type GenerateCanvasCodeOptions } from '@/lib/canvas-code-generator'

type RequestMessage = {
  id: number
  imageData: ImageData
  options?: GenerateCanvasCodeOptions
}

type ResponseMessage = {
  id: number
  result?: ReturnType<typeof generateCanvasCodeFromImageData>
  error?: string
}

const ctx = self as DedicatedWorkerGlobalScope

ctx.onmessage = (event: MessageEvent<RequestMessage>) => {
  try {
    const { id, imageData, options } = event.data
    const result = generateCanvasCodeFromImageData(imageData, options)
    const response: ResponseMessage = { id, result }
    ctx.postMessage(response)
  } catch (error) {
    const response: ResponseMessage = {
      id: event.data.id,
      error: error instanceof Error ? error.message : 'Unknown error generating code'
    }
    ctx.postMessage(response)
  }
}
