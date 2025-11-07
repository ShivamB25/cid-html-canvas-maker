# Codebase Structure Highlights
- `components/`: React client components; `ImageUploader` orchestrates uploads, worker comms, presets, previews, palette summaries.
- `lib/canvas-code-generator.ts`: Pixel-processing pipeline (blur, quantization, scanline/quadtree) exporting rectangle data + JS code.
- `lib/workers/code-generator.worker.ts`: wraps generator for off-main-thread execution.
