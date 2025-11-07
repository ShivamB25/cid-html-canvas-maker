# Detailed Setup Instructions

This guide will walk you through setting up the Canvas Image Uploader project from scratch.

## Prerequisites

Before you begin, make sure you have:

1. **Bun** installed on your system
   - Install from: https://bun.sh/
   - Verify: `bun --version`

2. **A Vercel account** (free tier is fine)
   - Sign up at: https://vercel.com/signup

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd cid-html-canvas-maker
bun install
```

This will install all required packages including:
- Next.js 14
- React 19
- Tailwind CSS v4
- Prisma ORM
- Vercel Blob SDK
- Vercel Postgres SDK
- react-dropzone
- nanoid

### 2. Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Continue with GitHub"** (or your preferred Git provider)
4. You can skip deployment for now - we just need the project for storage

### 3. Set Up Vercel Postgres

1. In your Vercel project dashboard, click on the **Storage** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose a name for your database (e.g., `canvas-uploader-db`)
5. Select your preferred region
6. Click **"Create"**
7. Once created, click on your database
8. Go to the **".env.local"** tab
9. You'll see three connection strings:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
10. Copy all three - you'll need them in the next step

### 4. Set Up Vercel Blob Storage

1. Still in the **Storage** tab of your Vercel project
2. Click **"Create Database"** again
3. This time select **"Blob"**
4. Choose a name (e.g., `canvas-uploader-blob`)
5. Click **"Create"**
6. Once created, click on your blob store
7. Go to the **".env.local"** tab
8. Copy the `BLOB_READ_WRITE_TOKEN`

### 5. Configure Environment Variables

1. In your project root, you'll find a `.env.local` file
2. Open it and replace the placeholder values with your actual credentials:

```env
# Vercel Postgres Database URLs (from step 3)
POSTGRES_URL="postgresql://username:password@host/database"
POSTGRES_PRISMA_URL="postgres://username:password@host/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://username:password@host/database"

# Vercel Blob Storage (from step 4)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abcd1234_xyz789"

# App Configuration (keep as is for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important Notes:**
- Make sure there are no spaces around the `=` sign
- Keep the quotes around the values
- Never commit this file to Git (it's already in .gitignore)

### 6. Initialize the Database

Now we need to create the database tables using Prisma:

```bash
bunx prisma db push
```

This command will:
- Read the schema from `prisma/schema.prisma`
- Create the `Image` table in your Postgres database
- Generate the Prisma Client

You should see output like:
```
✓ Generated Prisma Client
Database schema updated successfully
```

### 7. Verify Database Setup (Optional)

You can open Prisma Studio to visually inspect your database:

```bash
bunx prisma studio
```

This will open a web interface at http://localhost:5555 where you can see your `Image` table (currently empty).

### 8. Start the Development Server

```bash
bun dev
```

The application will start at http://localhost:3000

You should see:
```
▲ Next.js 16.0.1
- Local:        http://localhost:3000
✓ Ready in 1.2s
```

### 9. Test the Application

1. Open http://localhost:3000 in your browser
2. You should see the "Canvas Image Uploader" page
3. Try uploading an image:
   - Drag and drop an image file (JPG, PNG, or WebP)
   - Or click to select a file
   - The image should appear on a canvas
   - Click "Upload & Share"
   - You should get a shareable link
4. Test the shareable link:
   - Copy the generated link
   - Open it in a new tab
   - You should see your image with view count

## Troubleshooting

### Error: "Missing environment variable"

**Problem**: Prisma can't find database connection strings

**Solution**:
- Make sure `.env.local` exists in the project root
- Verify all environment variables are set correctly
- Restart your development server after changing `.env.local`

### Error: "Failed to upload image"

**Problem**: Blob storage token is invalid or missing

**Solution**:
- Verify `BLOB_READ_WRITE_TOKEN` in `.env.local`
- Make sure the token starts with `vercel_blob_rw_`
- Check that your Blob store is active in Vercel dashboard

### Error: "Database connection failed"

**Problem**: Can't connect to Postgres

**Solution**:
- Verify all three Postgres URLs are correct
- Check that your database is active in Vercel dashboard
- Make sure there are no extra spaces in the connection strings

### Images not displaying

**Problem**: Canvas not rendering or images not loading

**Solution**:
- Check browser console for errors
- Verify the blob URL is accessible (try opening it directly)
- Make sure your browser supports HTML5 Canvas
- Clear browser cache and reload

### Build errors related to TypeScript

**Problem**: Type errors during build

**Solution**:
```bash
# Regenerate Prisma Client
bunx prisma generate

# Clear Next.js cache
rm -rf .next

# Restart dev server
bun dev
```

## Next Steps

### Deploy to Vercel

Once everything is working locally:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. In Vercel dashboard:
   - Click **"Import Project"**
   - Select your GitHub repository
   - Vercel will auto-detect Next.js
   - Add the same environment variables from `.env.local`
   - Click **"Deploy"**

3. After deployment:
   - Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL
   - Redeploy if needed

### Add Features

Some ideas to extend the project:
- Image editing tools (crop, resize, filters)
- User authentication
- Image galleries
- Admin dashboard
- Analytics
- Rate limiting
- Image compression options

## Support

If you encounter any issues not covered here:

1. Check the main [README.md](README.md)
2. Review the [Vercel documentation](https://vercel.com/docs)
3. Check [Prisma documentation](https://www.prisma.io/docs)
4. Open an issue on GitHub

## Useful Commands

```bash
# Development
bun dev                    # Start dev server
bun build                  # Build for production
bun start                  # Start production server

# Database
bunx prisma studio         # Open database GUI
bunx prisma db push        # Push schema changes
bunx prisma generate       # Regenerate Prisma Client
bunx prisma migrate dev    # Create migration (for production)

# Utilities
bun lint                   # Run ESLint
bun add <package>          # Install package
bun remove <package>       # Remove package
```

---

Happy coding! 🚀
