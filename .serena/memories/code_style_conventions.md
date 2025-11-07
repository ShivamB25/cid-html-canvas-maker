# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2017
- **Strict Mode**: Enabled
- **Module System**: ESNext with bundler resolution
- **JSX**: react-jsx
- **Path Aliases**: `@/*` maps to project root

## Code Style

### React Components
- Use **functional components** with hooks
- Export default for page components and main components
- Use named exports where appropriate

### Naming Conventions
- **Components**: PascalCase (e.g., `ImageUploader`, `CanvasDisplay`)
- **Functions/Variables**: camelCase (e.g., `handleDownload`, `imageFile`)
- **Constants**: camelCase for local, UPPER_SNAKE_CASE for global constants
- **Files**: PascalCase for components (e.g., `ImageUploader.tsx`), kebab-case for utilities

### TypeScript Usage
- Strict typing enabled
- Use type annotations for function parameters
- Use React types: `useState<File | null>()`, `useRef<HTMLCanvasElement>(null)`
- Properly type event handlers and callbacks

### Component Structure
Example from ImageUploader:
```typescript
export default function ComponentName() {
  // State declarations
  const [state, setState] = useState<Type>(initialValue)
  
  // Refs
  const ref = useRef<Type>(null)
  
  // Callbacks and handlers
  const handleAction = useCallback(() => {
    // implementation
  }, [dependencies])
  
  // Render
  return (
    // JSX
  )
}
```

### Styling
- Use **Tailwind CSS** utility classes
- Template literals for conditional classes
- Dark mode support with `dark:` prefix
- Responsive design with breakpoint prefixes

### File Organization
- One component per file
- Co-locate related files in feature directories
- Keep components in `/components` directory
- Keep pages in `/app` directory (App Router)
