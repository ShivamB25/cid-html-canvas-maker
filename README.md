# Canvas Image Uploader

A modern web application for uploading images, displaying them on HTML Canvas, and generating shareable links. Built with Next.js 14, Vercel Blob Storage, and PostgreSQL.

## Features

- 🖼️ **Drag & Drop Upload** - Upload JPG, PNG, and WebP images with ease
- 🎨 **HTML5 Canvas Display** - Images are rendered on HTML Canvas for optimal performance
- 🔗 **Shareable Links** - Generate short, unique URLs for each uploaded image
- 📊 **View Tracking** - Track how many times each image has been viewed
- 🌙 **Dark Mode Support** - Automatic dark/light theme based on user preference
- ⚡ **Fast & Scalable** - Powered by Vercel Blob Storage and PostgreSQL

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: Vercel Blob Storage
- **Database**: Vercel Postgres + Prisma ORM
- **File Upload**: react-dropzone
- **ID Generation**: nanoid

## Prerequisites

- Bun installed (v1.0.0 or higher)
- Vercel account (for Blob Storage and Postgres)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select an existing one
3. Go to the **Storage** tab
4. Create a new **Postgres** database
5. Copy the connection strings

### 3. Set up Vercel Blob Storage

1. In the same Vercel project
2. Go to the **Storage** tab
3. Create a new **Blob** store
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 4. Configure environment variables

Update `.env.local` with your Vercel credentials:

```env
# Vercel Postgres Database URLs
POSTGRES_URL="your-postgres-url-here"
POSTGRES_PRISMA_URL="your-postgres-prisma-url-here"
POSTGRES_URL_NON_POOLING="your-postgres-url-non-pooling-here"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your-blob-token-here"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Push database schema

```bash
bunx prisma db push
```

### 6. Run the development server

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
├── lib/
│   └── prisma.ts            # Prisma client
└── prisma/
    └── schema.prisma        # Database schema
```

## Usage

1. **Upload**: Drag and drop an image or click to select
2. **Preview**: View the image on HTML Canvas
3. **Share**: Click "Upload & Share" to get a shareable link
4. **View**: Share the link with anyone to view the image

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bunx prisma studio` - Open database GUI
- `bunx prisma db push` - Push schema changes

## Deploy on Vercel

1. Push your code to GitHub
2. Import the repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

---

Built with ❤️ using Next.js and Vercel
