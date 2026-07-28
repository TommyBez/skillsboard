#!/usr/bin/env bash
# Wrapper: Node must see NODE_USE_ENV_PROXY at startup for external captures.
set -euo pipefail
export NODE_USE_ENV_PROXY=1
exec node "$(dirname "$0")/capture.mjs" "$@"
