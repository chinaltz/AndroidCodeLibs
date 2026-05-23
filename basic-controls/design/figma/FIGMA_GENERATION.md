# Figma Generation

`design/figma/scripts/create_basic_controls_figma_expanded.js` is the current recommended Figma script. It is adapted from the migrated BaseWidget generator and expanded against the coverage of `Digital Channel Product Line Component`.

`design/figma/scripts/create_basic_controls_figma.js` is kept as the earlier compact draft.

## Output

The script creates:

- `00 Tokens`: Sky Planet color and style token boards.
- `01 Expanded Components + Android View Mapping`: grouped component catalogue plus Java class names, XML/ViewGroup strategy, Drawable and StateListDrawable notes.
- `02 Theme Preview`: 390x844 Android preview screen and Android View mapping notes.

The output intentionally uses 3 pages because Figma Starter files are limited to 3 pages.

## How To Use

1. Open or create a Figma Design file.
2. Use Codex/Figma MCP `use_figma`.
3. Execute the full content of `design/figma/scripts/create_basic_controls_figma_expanded.js`.
4. Convert generated component frames into Figma Components / Variants.
5. Convert token boards into Figma Variables.

## Notes

- This script is intentionally local and deterministic.
- It does not publish or mutate any Figma file until executed through Figma MCP.
- The generated visuals should match `design/tokens/color_token.json` and `design/tokens/style_token.json`.

## Latest Sync Attempt

- Target file: `jwhypmSy7xew6p6sQkC2MH`
- Script: `design/figma/scripts/create_basic_controls_figma_expanded.js`
- Result: blocked before upload by Figma MCP Starter plan tool-call limit.
- Error summary: `You've reached the Figma MCP tool call limit on the Starter plan.`
- Follow-up: retry the same script after the MCP quota resets or after upgrading the Figma MCP plan. Android View library generation can continue locally because it only depends on the token JSON files.
