#!/usr/bin/env bash
# Wrapper: Node must see NODE_USE_ENV_PROXY at startup for external captures —
# setting it inside the script is too late. Same trick as refs/shot.sh.
#   ./refs/harness/run.sh profile.mjs https://linear.app linear
set -euo pipefail
export NODE_USE_ENV_PROXY=1
tool="$1"; shift
exec node "$(dirname "$0")/$tool" "$@"
