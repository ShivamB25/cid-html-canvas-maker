# Suggested Commands

## Development Commands

### Start Development Server
```bash
bun dev
# or
npm run dev
```
Opens development server at http://localhost:3000

### Build for Production
```bash
bun run build
# or
npm run build
```

### Start Production Server
```bash
bun start
# or
npm start
```

### Linting
```bash
bun run lint
# or
npm run lint
```
Runs ESLint with Next.js configuration

### Install Dependencies
```bash
bun install
# or
npm install
```

## System Commands (macOS/Darwin)

### File Operations
- `ls` - list directory contents
- `find . -name "pattern"` - find files by name
- `grep -r "pattern" .` - search file contents
- `cat filename` - display file contents
- `cd directory` - change directory

### Git Operations
- `git status` - check repository status
- `git add .` - stage all changes
- `git commit -m "message"` - commit changes
- `git push` - push to remote
- `git pull` - pull from remote

## Notes
- This project uses **Bun** as the primary package manager (as indicated in README)
- Can also use npm/yarn/pnpm as alternatives
- System is macOS (Darwin), so standard Unix commands apply
