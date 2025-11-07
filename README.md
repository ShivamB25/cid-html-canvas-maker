# Canvas Image Uploader

A lightweight web application for uploading images, displaying them on HTML Canvas, and generating temporary shareable links. Built with Next.js 14 and Vercel Blob Storage.

## Features

- 🖼️ **Drag & Drop Upload** - Upload JPG, PNG, and WebP images with ease
- 🎨 **HTML5 Canvas Display** - Images are rendered on HTML Canvas for optimal performance
- 🔗 **Shareable Links** - Generate short, unique URLs for each uploaded image
- 📊 **View Tracking** - Track how many times each image has been viewed (session-based)
- 🌙 **Dark Mode Support** - Automatic dark/light theme based on user preference
- ⚡ **Lightweight** - In-memory storage, no database required
- 🚀 **Fast** - Powered by Vercel Blob Storage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: Vercel Blob Storage + In-Memory Cache
- **File Upload**: react-dropzone
- **ID Generation**: nanoid

## Prerequisites

- Bun installed (v1.0.0 or higher)
- Vercel account (for Blob Storage)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Vercel Blob Storage

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select an existing one
3. Go to the **Storage** tab
4. Create a new **Blob** store
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Configure environment variables

Update `.env.local` with your Vercel Blob token:

```env
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-blob-token-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
cid-html-canvas-maker/
├── app/
│   ├── [imageId]/           # Dynamic route for shared images
│   ├── api/upload/          # Upload API endpoint
│   └── page.tsx             # Main upload page
├── components/
│   ├── ImageUploader.tsx    # Upload + dropzone component
│   ├── CanvasDisplay.tsx    # Canvas rendering component
│   └── ShareLink.tsx        # Copy link component
└── lib/
    └── storage.ts           # In-memory storage
```

## How It Works

1. **Upload**: User drags/drops or selects an image (JPG/PNG/WebP)
2. **Canvas**: Image displays on HTML Canvas with preview
3. **Upload to Blob**: Canvas converts to Blob and uploads to Vercel Blob Storage
4. **Generate Link**: Creates short ID (e.g., "abc123XY") and stores metadata in memory
5. **Share**: User gets shareable link like `https://yourapp.com/abc123XY`
6. **View**: Anyone with the link can view the image (view count tracked)

**Note**: Shareable links are **temporary** - they exist as long as the server is running. When you restart the dev server, links will be cleared (images remain in Blob Storage).

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server

## Deploy on Vercel

1. Push your code to GitHub
2. Import the repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

---

Built with ❤️ using Next.js and Vercel
