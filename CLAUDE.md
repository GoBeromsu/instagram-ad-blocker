# Instagram Ad & Recommendation Blocker

Chrome Extension to block sponsored ads and recommended posts from Instagram feed.

## Project Overview

This extension uses DOM analysis to detect and hide:

- **Sponsored posts (광고)**: Posts marked with "Sponsored" label
- **Recommended posts (추천)**: "Suggested for you" sections in the feed

## Tech Stack

- **Chrome Extension Manifest V3** (latest standard)
- **TypeScript** with Vite build system
- **CRXJS** Vite plugin for Chrome extension development

## Project Structure

```
instragram_blocker/
├── src/
│   ├── content/          # Content scripts (DOM manipulation)
│   ├── background/       # Service worker
│   ├── popup/            # Extension popup UI
│   └── utils/            # Shared utilities
├── assets/icons/         # Extension icons
├── manifest.json         # Extension manifest
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode (hot reload)
pnpm dev

# Build for production
pnpm build
```

## Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder (after build) or project root (during dev)

## Key Features

### Content Script Detection Logic

1. **MutationObserver**: Watches for dynamically loaded posts
2. **Keyword Detection**: Multi-language support for "Sponsored" text
   - English, Korean (광고), Spanish, German, French, etc.
3. **DOM Traversal**: Finds appropriate container to hide entire post

### Supported Languages for Ad Detection

- English: "Sponsored"
- Korean: "광고"
- Spanish: "Publicidad"
- German: "Gesponsert"
- French: "Sponsorisé"
- Portuguese: "Patrocinado"
- Japanese: "広告"
- Chinese: "贊助" / "赞助"

## MCP Tools

This project uses **Playwright MCP** for browser automation and DOM analysis:

```bash
# Playwright MCP is configured in .mcp.json (project scope)
npx @playwright/mcp@latest
```

## Commands

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `pnpm dev`       | Start development server with HMR |
| `pnpm build`     | Build for production              |
| `pnpm lint`      | Run ESLint                        |
| `pnpm typecheck` | Run TypeScript type checking      |

## Notes

- Instagram frequently changes their DOM structure
- Selectors may need updates if blocking stops working
- Use Playwright MCP or browser DevTools to analyze current DOM structure
