#!/bin/bash

# Claude Code PostToolUse hook for auto-formatting with Prettier
# Triggered after Edit or Write tool calls

# Read JSON from stdin and extract file path
file_path=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Exit if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
  exit 0
fi

# Format TypeScript, JavaScript, CSS, HTML, JSON files
if [[ "$file_path" =~ \.(ts|tsx|js|jsx|css|html|json)$ ]]; then
  cd "$CLAUDE_PROJECT_DIR" || exit 1

  # Run prettier on the file
  if pnpm exec prettier --write "$file_path" 2>/dev/null; then
    echo "Formatted: $(basename "$file_path")"
  fi
fi

exit 0
