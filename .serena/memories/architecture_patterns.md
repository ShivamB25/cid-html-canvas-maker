# Architecture Highlights

- Web Worker offloads Canvas code generation (scanline/quadtree pipeline) to keep UI responsive.
- Generator pipeline: optional blur ➝ color quantization ➝ scanline/quadtree rectangle extraction ➝ JS code emission + rectangle metadata.
- UI uses presets + sliders, palette summary, preview canvas replay, and download helpers.
