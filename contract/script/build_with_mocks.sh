#!/usr/bin/env bash
set -euo pipefail

# Run the DeployWithMocks Foundry build from the contract root
CONTRACT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v forge >/dev/null 2>&1; then
    echo "Error: forge binary not found in PATH. Please run foundryup first." >&2
    exit 1
fi

pushd "$CONTRACT_ROOT" >/dev/null
forge build --contracts script/DeployWithMocks.s.sol "$@"
popd >/dev/null
