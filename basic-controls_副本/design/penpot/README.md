# Penpot Design Sync

Penpot is now the primary editable design target for Basic Controls.

- Penpot file: https://design.penpot.app/#/workspace?team-id=e7a86fff-661d-81c1-8008-103779d6d184&file-id=e7a86fff-661d-81c1-8008-10381337624c&page-id=e7a86fff-661d-81c1-8008-10381337624d
- Source color tokens: `../tokens/color_token.json`
- Source style tokens: `../tokens/style_token.json`
- Generated token import: `penpot-token-import.json`
- Generated design brief: `penpot-design-brief.md`
- Local visual preview: `preview/basic-controls-preview.html`
- Codex MCP setup: `CODEX_MCP_SETUP.md`

## Workflow

1. Edit only `design/tokens/color_token.json` and `design/tokens/style_token.json` for skinning.
2. Run `node design/penpot/scripts/generate_penpot_artifacts.cjs`.
3. Use the configured Penpot Cloud MCP server from Codex.
4. Restart/refresh Codex after MCP config changes so the `penpot` tools are loaded.
5. Sync token values/pages from the generated files through Penpot MCP when available.
6. Keep Android components mapped to the same semantic token keys.

Local fallback: run `bash design/penpot/scripts/start_penpot_mcp.sh` and point Codex at `http://localhost:4401/mcp`.

Figma remains an optional export path. Penpot is the source design workspace going forward.
