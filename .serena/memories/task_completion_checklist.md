# Task Completion Checklist

When completing a coding task in this project, follow these steps:

## 1. Code Quality Checks

### Linting
```bash
bun run lint
```
- Fix any ESLint errors or warnings
- Ensure code follows Next.js and TypeScript best practices

### Type Checking
```bash
npx tsc --noEmit
```
- Ensure no TypeScript errors
- Verify all types are correctly defined

## 2. Testing (if applicable)
- Currently no test suite is configured
- Manual testing in browser is required
- Test in both light and dark modes

## 3. Build Verification
```bash
bun run build
```
- Ensure the project builds successfully
- Check for any build warnings or errors
- Verify no type errors in production build

## 4. Manual Testing Checklist
- [ ] Test image upload with drag & drop
- [ ] Test image upload with file picker
- [ ] Test canvas rendering
- [ ] Test download functionality
- [ ] Test dark mode toggle
- [ ] Test responsive design on different screen sizes
- [ ] Verify supported formats: JPG, PNG, WebP

## 5. Code Review Checklist
- [ ] Code follows TypeScript conventions
- [ ] Proper error handling implemented
- [ ] No console.log statements left in code
- [ ] Tailwind classes used appropriately
- [ ] Component is properly typed
- [ ] No unused imports or variables
- [ ] Accessibility considerations met

## 6. Git Workflow
```bash
git add .
git commit -m "descriptive message"
git push
```

## Notes
- Always run linting before committing
- Verify the build passes before pushing
- Test in development mode first (`bun dev`)
- Check both light and dark modes
