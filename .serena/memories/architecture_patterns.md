# Architecture and Design Patterns

## Next.js App Router Architecture

### File-based Routing
- Pages are defined in the `app/` directory
- Dynamic routes use `[param]` folder naming (e.g., `app/[imageId]/`)
- API routes in `app/api/` directory

### Component Organization
- **Page Components**: In `app/` directory, export default
- **Reusable Components**: In `components/` directory
- **Utilities**: In `lib/` directory (currently empty)

## Design Patterns Used

### Client-Side State Management
- React hooks: `useState`, `useCallback`, `useRef`
- No global state management (Redux, Zustand, etc.)
- Local component state for UI interactions

### Image Handling Pattern
1. User drops/selects image
2. Create object URL with `URL.createObjectURL(file)`
3. Render on canvas element
4. Download via canvas `toBlob()` method
5. Cleanup with `URL.revokeObjectURL()`

### API Routes Pattern
- Edge runtime configuration: `export const runtime = 'edge'`
- RESTful endpoints (e.g., POST for uploads)
- Integration with Vercel Blob storage

### Component Composition
- Small, focused components
- Props-based data flow
- Ref forwarding for DOM access (canvas)

## Key Libraries Usage

### react-dropzone
```typescript
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: { 'image/jpeg': ['.jpg', '.jpeg'], ... },
  maxFiles: 1,
  multiple: false
})
```

### Canvas API
- Direct canvas manipulation via `useRef<HTMLCanvasElement>`
- Image rendering with `drawImage()`
- Export with `toBlob()` method

### Vercel Blob
- Used in upload API route
- Server-side blob storage
- Integration with Vercel platform

## Styling Approach
- **Utility-First**: Tailwind CSS v4
- **Dark Mode**: CSS class-based (`dark:` prefix)
- **Responsive**: Mobile-first approach
- **Conditional Styling**: Template literals with ternary operators

## Performance Considerations
- Client-side image processing (no server overhead)
- Object URL cleanup to prevent memory leaks
- Edge runtime for API routes
- Next.js automatic code splitting
