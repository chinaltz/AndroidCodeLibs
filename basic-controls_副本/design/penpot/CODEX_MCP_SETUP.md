# Codex Penpot MCP Setup

This project is prepared to use Penpot's official MCP server.

## Current Codex Config

The global Codex MCP entry has been added for Penpot Cloud remote MCP.
The account token is stored only in the local Codex config and must not be committed to this repository.

```text
penpot -> https://design.penpot.app/mcp/stream?userToken=...
```

You can verify it with:

```bash
codex mcp get penpot
```

If you ever need to recreate the remote entry, use the MCP URL copied from Penpot's MCP settings. Do not paste the token into project files.

```bash
codex mcp remove penpot
codex mcp add penpot --url "https://design.penpot.app/mcp/stream?userToken=YOUR_TOKEN"
```

## Reload Codex Tools

Codex reads MCP server definitions when a session/tool host starts. After changing the MCP URL, restart or refresh Codex so the `penpot` tools appear in the tool list.

## Local MCP Bridge Fallback

Use this only if the remote Penpot Cloud MCP is unavailable.

```bash
codex mcp remove penpot
codex mcp add penpot --url http://localhost:4401/mcp
```

Then start the local bridge.

From the repository root:

```bash
bash basic-controls/design/penpot/scripts/start_penpot_mcp.sh
```

The official Penpot MCP package starts two local services:

- Penpot plugin manifest: `http://localhost:4400/manifest.json`
- Codex MCP endpoint: `http://localhost:4401/mcp`

## Connect Penpot For Local Bridge

1. Open the Penpot file:
   `https://design.penpot.app/#/workspace?team-id=e7a86fff-661d-81c1-8008-103779d6d184&file-id=e7a86fff-661d-81c1-8008-10381337624c&page-id=e7a86fff-661d-81c1-8008-10381337624d`
2. Open `Plugins`.
3. Load the development plugin URL:
   `http://localhost:4400/manifest.json`
4. Open the plugin UI.
5. Click `Connect to MCP server`.
6. Keep the plugin UI open while Codex is writing to Penpot.

## Notes

- Do not commit secrets or Penpot account tokens. The local MCP flow above does not require a token in this repository.
- Penpot MCP's README recommends Node.js 22.x. This machine currently has Node.js 20.x; if the MCP package fails during bootstrap, upgrade Node for this terminal before running the script again.
- The browser may ask for permission to let `design.penpot.app` access `localhost`; allow it.
