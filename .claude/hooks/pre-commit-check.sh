#!/bin/bash

# Pre-commit check hook - runs typecheck before git commit

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [[ "$command" =~ ^git\ commit ]] || [[ "$command" =~ \&\&\ *git\ commit ]]; then
  cd "$CLAUDE_PROJECT_DIR" || exit 1

  echo "Running typecheck..."
  if ! pnpm typecheck 2>&1; then
    echo "TypeScript errors. Fix before commit."
    exit 1
  fi
  echo "Typecheck passed!"
fi

exit 0
