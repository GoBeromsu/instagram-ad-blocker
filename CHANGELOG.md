# Changelog

All notable changes to Instagram Ad & Recommendation Blocker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-01

### Changed

- **iOS-style Popup UI**: Complete redesign with Apple-inspired aesthetics
  - Sliding page navigation with smooth animations
  - Inset grouped list design
  - SF-style toggle switches
  - Hierarchical settings pages (Home → Feed, Utilities)
- **Rebranding**: Updated app name to "InstaFocus"

### Improved

- Better visual hierarchy and spacing
- More intuitive settings organization
- Contact developer option added

## [1.0.0] - 2025-01-01

### Added

- **Ad Detection**: Automatically detects and hides sponsored posts in Instagram feed
- **Recommendation Blocking**: Blocks suggested/recommended posts that interrupt your feed
- **Multi-language Support**: Detection works with multiple languages (English, Korean, Japanese, etc.)
- **Debug Mode**: Toggle debug logging for troubleshooting detection issues
- **Badge Counter**: Shows the number of blocked posts on the extension icon
- **Minimal Popup UI**: Clean Google Material-style popup with toggle controls
- **MutationObserver**: Efficiently watches for dynamically loaded content

### Technical

- Built with TypeScript + Vite + CRXJS (Manifest V3)
- Modular detector architecture for ads and suggestions
- Shared utility modules for logging and DOM manipulation
- ESLint + Prettier for code quality

## [Unreleased]

### Planned

- Custom blocking rules
- Whitelist support
- Statistics dashboard
