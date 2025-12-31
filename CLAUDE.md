# Instagram Ad & Recommendation Blocker

Chrome Extension (Manifest V3) to block sponsored ads and recommended posts from Instagram feed using TypeScript + Vite + CRXJS.

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Development mode with HMR
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript type checking
```

## Project Structure

```
src/
├── types/        # TypeScript type definitions (Message, Settings, etc.)
├── content/      # Content script - ad/recommendation detection & blocking logic
├── background/   # Service worker - badge updates, storage management
├── popup/        # Extension popup UI and settings toggle
└── utils/        # Shared utilities (logger, dom helpers)

assets/
└── icons/        # Extension icons (16px, 48px, 128px)

dist/             # Build output (gitignored)
```

## Detection Logic

- **MutationObserver**: Watches for dynamically loaded posts
- **Multi-language keyword detection**: See `src/content/detectors/ad-detector.ts` for supported languages
- **DOM Traversal**: Finds and hides entire post containers

## Development Guidelines

### DOM Analysis with Playwright

Instagram frequently changes their DOM structure. **Use Playwright MCP** for DOM analysis when selectors need updates:

```bash
# Playwright MCP is configured in .mcp.json
npx @playwright/mcp@latest
```

### Loading Extension

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `dist` folder
