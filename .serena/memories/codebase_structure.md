# Codebase Structure

## Directory Layout

```
cid-html-canvas-maker/
├── app/                        # Next.js App Router directory
│   ├── [imageId]/             # Dynamic route for image viewing
│   │   ├── ImageViewer.tsx    # Image viewer component
│   │   └── page.tsx           # Image page
│   ├── api/                   # API routes
│   │   └── upload/
│   │       └── route.ts       # Upload API endpoint
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/                # Reusable React components
│   ├── ImageUploader.tsx      # Image upload component with drag & drop
│   └── CanvasDisplay.tsx      # Canvas rendering component
├── lib/                       # Utility libraries (currently empty)
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
└── postcss.config.mjs         # PostCSS configuration
```

## Key Files
- **app/page.tsx**: Main landing page with image uploader
- **components/ImageUploader.tsx**: Main component for drag & drop image upload and canvas rendering
- **components/CanvasDisplay.tsx**: Canvas display component
- **app/api/upload/route.ts**: API route for image uploads (Vercel Blob storage)
