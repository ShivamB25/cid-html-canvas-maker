# Canvas Image Viewer

A lightweight, client-side web application for viewing images on HTML5 Canvas and downloading them to your device. Built with Next.js 14.

## Features

- 🖼️ **Drag & Drop Upload** - Upload JPG, PNG, and WebP images with ease
- 🎨 **HTML5 Canvas Display** - Images are rendered on HTML Canvas for optimal performance
- 💾 **Download to Device** - Save canvas images directly to your device
- 🌙 **Dark Mode Support** - Automatic dark/light theme based on user preference
- ⚡ **Client-Side Only** - No server uploads, all processing happens in your browser
- 🚀 **Fast** - Instant preview and download

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **File Upload**: react-dropzone
- **Canvas**: HTML5 Canvas API

## Prerequisites

- Bun installed (v1.0.0 or higher)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
cid-html-canvas-maker/
├── app/
│   ├── [imageId]/           # Legacy route (not used)
│   ├── api/upload/          # Legacy API (not used)
│   └── page.tsx             # Main viewer page
└── components/
    ├── ImageUploader.tsx    # Upload + dropzone component
    └── CanvasDisplay.tsx    # Canvas rendering component
```

## How It Works

1. **Upload**: User drags/drops or selects an image (JPG/PNG/WebP)
2. **Canvas**: Image displays instantly on HTML5 Canvas with preview
3. **Download**: User can download the canvas image to their device
4. **Client-Side**: All processing happens in the browser - no server uploads

**Note**: This is a client-side only application. Images are processed locally in your browser and never uploaded to any server.

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server

## Deploy

1. Push your code to GitHub
2. Import the repository to Vercel (or any static hosting)
3. Deploy!

No environment variables or backend setup required - it's purely client-side.

---

Built with ❤️ using Next.js and Vercel
