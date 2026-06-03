#!/usr/bin/env bash
set -euo pipefail

# 启动 Penpot 官方 MCP 本地服务。
# - Plugin manifest: http://localhost:4400/manifest.json
# - MCP endpoint:     http://localhost:4401/mcp
# 运行期间不要关闭该终端，也不要关闭 Penpot 里的 MCP plugin UI。

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Penpot MCP recommends Node.js 22.x." >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required. It normally ships with Node.js/npm." >&2
  exit 1
fi

echo "Starting Penpot MCP..."
echo "Penpot plugin manifest: http://localhost:4400/manifest.json"
echo "Codex MCP endpoint:     http://localhost:4401/mcp"
echo
echo "After this server starts:"
echo "1. Open the Penpot file in a browser."
echo "2. Plugins -> load development plugin URL: http://localhost:4400/manifest.json"
echo "3. Open the plugin UI and click 'Connect to MCP server'."
echo "4. Restart/refresh Codex so the configured 'penpot' MCP tools are loaded."
echo

exec npx -y @penpot/mcp@latest
