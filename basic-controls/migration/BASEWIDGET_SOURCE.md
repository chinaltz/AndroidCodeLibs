# BaseWidget Migration Note

Source workspace:

```text
/Users/litingzhe/Documents/BaseWidget
```

Migrated source files reviewed:

- `README.md`
- `design/tokens/color_token.json`
- `design/tokens/style_token.json`
- `design/figma/FIGMA_GENERATION.md`
- `design/figma/basewidget_animal_island_design_spec.md`
- `design/figma/scripts/create_basewidget_figma.js`
- `android/compose/token_mapping.md` from the source workspace was reviewed, then replaced by `android/view/token_mapping.md` for the current Java + Android View direction.

Migration decision:

- Keep the original token-driven architecture.
- Rename the current workspace package to `basic-controls`.
- Replace the Animal Island skin with the 技趣星球 `Sky Planet` visual style.
- Keep Figma generation script local and executable in a Figma Design file.
