# Animal Island Style Mapping

This file records how Basic Controls borrows the shape language of `animal-island-ui` while keeping the Sky Planet blue theme.

## References

- Online demo: `https://animal-island-ui.netlify.app/#/modal`
- Source repository: `https://github.com/guokaigdg/animal-island-ui`

## What To Borrow

- Pill-shaped primary controls.
- Thick but soft control borders.
- Game-like bottom lift shadow for clickable components.
- Organic rounded cards, dialogs, and panels.
- Friendly, round, readable typography.
- Illustrated dividers and soft empty-state surfaces.
- Pressed state that visually drops down instead of using only opacity.

## What Not To Borrow

- Brown / parchment / island-warm palette.
- Direct Animal Crossing-like art assets.
- Dense decorative backgrounds that reduce Android app readability.
- Web-only implementation details that do not map cleanly to Java View/XML.

## Sky Planet Mapping

| Style trait | Token mapping |
|-------------|---------------|
| Primary action fill | `color.semantic.brand.primary` |
| Button text | `color.semantic.control.button.primaryText` |
| Default control fill | `color.semantic.control.button.defaultBackground` |
| Control border | `color.semantic.border.control` |
| Raised surface | `color.semantic.background.surfaceRaised` |
| Disabled surface | `color.semantic.background.surfaceDisabled` |
| Island lift shadow | `style.shadow.controlIslandLift` |
| Pressed shadow | `style.shadow.controlPressed` |
| Rounded control | `style.radius.controlIsland` or `style.radius.pill` |
| Organic card | `style.radius.cardOrganic` |
| Organic dialog | `style.radius.dialogOrganic` |

## Android View Notes

- Prefer `GradientDrawable` plus `StateListDrawable` for the raised button, chip, card, input, and dialog backgrounds.
- For 3D button lift, use a wrapped layout: top button surface over a bottom shadow shape. On pressed state, reduce `translationY` gap from `style.shadow.controlIslandLift.y` to `style.shadow.controlPressed.y`.
- Keep all colors resolved through `BasicThemeManager.colors()`.
- Keep all dimensions resolved through `BasicThemeManager.style()`.
