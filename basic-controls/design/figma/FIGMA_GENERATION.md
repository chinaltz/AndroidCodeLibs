# Figma Generation

`design/figma/scripts/create_basic_controls_figma.js` is a Figma script adapted from the migrated BaseWidget generator.

## Output

The script creates:

- `00 Tokens`: Sky Planet color and style token boards.
- `01 Components`: Button, Input, Checkbox, Switch, Select, Card, Collapse, Modal, Tabs, Divider, Loading component drafts.
- `02 Android View Mapping`: Java class names, XML/ViewGroup strategy, Drawable and StateListDrawable notes.
- `03 Theme Preview`: 390x844 Android preview screen, modal example, and Android View mapping notes.

## How To Use

1. Open or create a Figma Design file.
2. Use Codex/Figma MCP `use_figma`.
3. Execute the full content of `design/figma/scripts/create_basic_controls_figma.js`.
4. Convert generated component frames into Figma Components / Variants.
5. Convert token boards into Figma Variables.

## Notes

- This script is intentionally local and deterministic.
- It does not publish or mutate any Figma file until executed through Figma MCP.
- The generated visuals should match `design/tokens/color_token.json` and `design/tokens/style_token.json`.
