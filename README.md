<p align="center">
  <img src="assets/icons/icon128.png" alt="InstaFocus Logo" width="128" height="128">
</p>

<h1 align="center">InstaFocus</h1>

<p align="center">
  <strong>Block ads, reels, and suggested posts. Experience a clean, distraction-free Instagram feed.</strong>
</p>

<p align="center">
  <a href="https://github.com/GoBeromsu/instagram-ad-blocker/releases/latest">
    <img src="https://img.shields.io/github/v/release/GoBeromsu/instagram-ad-blocker?style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/GoBeromsu/instagram-ad-blocker/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/GoBeromsu/instagram-ad-blocker?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/GoBeromsu/instagram-ad-blocker/stargazers">
    <img src="https://img.shields.io/github/stars/GoBeromsu/instagram-ad-blocker?style=flat-square" alt="Stars">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Why InstaFocus?

Instagram's feed is cluttered with sponsored posts, suggested content, and endless reels that steal your attention. **InstaFocus** gives you back control by automatically hiding these distractions, letting you focus on content from people you actually follow.

## Features

- **Ad Blocking** — Automatically detects and hides sponsored posts
- **Suggestion Blocking** — Removes "Suggested for you" posts from your feed
- **Multi-language Support** — Works with Instagram in English, Korean, Japanese, and more
- **iOS-style UI** — Beautiful, intuitive popup with smooth animations
- **Badge Counter** — See how many distractions have been blocked
- **Debug Mode** — Troubleshoot detection issues with detailed logging
- **Privacy-focused** — No data collection, everything runs locally

## Installation

### From GitHub Releases (Recommended)

1. Download the latest `instagram-ad-blocker-vX.X.X.zip` from [Releases](https://github.com/GoBeromsu/instagram-ad-blocker/releases/latest)
2. Extract the zip file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right corner)
5. Click **Load unpacked** and select the extracted folder
6. Visit Instagram and enjoy a cleaner feed!

### From Source

```bash
# Clone the repository
git clone https://github.com/GoBeromsu/instagram-ad-blocker.git
cd instagram-ad-blocker

# Install dependencies
pnpm install

# Build the extension
pnpm build

# Load the 'dist' folder as an unpacked extension in Chrome
```

## Usage

1. Click the **InstaFocus** icon in your Chrome toolbar
2. Toggle features on/off:
   - **Block Ads** — Hide sponsored posts
   - **Block Suggestions** — Hide recommended content
   - **Debug Mode** — Enable console logging
3. The badge shows how many items have been blocked in your current session

### Settings Pages

| Page | Description |
|------|-------------|
| **Home** | Master toggle and blocked items counter |
| **Feed** | Configure ad and suggestion blocking |
| **Utilities** | Debug mode and developer options |

## How It Works

InstaFocus uses a `MutationObserver` to watch for dynamically loaded content on Instagram. When new posts appear, it analyzes the DOM structure to detect:

- **Sponsored indicators** — Text like "Sponsored", "광고", "広告", etc.
- **Suggestion markers** — "Suggested for you" labels and similar patterns

Detected posts are hidden by setting `display: none` on the container element, ensuring a seamless browsing experience.

## Development

### Prerequisites

- Node.js 18+
- pnpm 9+

### Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Development mode with HMR
pnpm build        # Production build
pnpm typecheck    # TypeScript type checking
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
```

### Project Structure

```
src/
├── content/      # Content script - detection & blocking logic
├── background/   # Service worker - badge updates, storage
├── popup/        # Extension popup UI (iOS-style)
├── types/        # TypeScript type definitions
└── utils/        # Shared utilities (logger, DOM helpers)
```

### Tech Stack

- **TypeScript** — Type-safe development
- **Vite** — Fast build tooling
- **CRXJS** — Chrome Extension Vite plugin (Manifest V3)
- **ESLint + Prettier** — Code quality and formatting

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** — Open an issue describing the problem
2. **Suggest features** — Share ideas for improvements
3. **Submit PRs** — Fix bugs or implement new features

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm typecheck && pnpm lint`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Roadmap

- [ ] Chrome Web Store release
- [ ] Custom blocking rules
- [ ] Whitelist support
- [ ] Statistics dashboard
- [ ] Firefox support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- UI inspired by Apple iOS design language

---

<p align="center">
  Made with focus in mind
</p>
