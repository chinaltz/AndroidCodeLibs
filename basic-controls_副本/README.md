# Basic Controls

Basic Controls is the current workspace version of the former `BaseWidget` draft.

It keeps the same goal: a token-driven Android component system that can also be generated in Figma. The first implementation target is Java + classic Android View/XML, not Compose. The visual language is no longer the old Animal Island skin. It now follows the 技趣星球 `Sky Planet` style: blue sky, white clouds, clean surfaces, light blue borders, rounded controls, and a bright friendly mood.

## Contents

- `design/tokens/color_token.json`: color primitives and semantic colors.
- `design/tokens/style_token.json`: radius, size, spacing, typography, shadow, and motion tokens.
- `PACKAGING.md`: library/sample boundaries and publish verification commands for every platform.
- `PLATFORM_STRUCTURE.md`: cross-platform source layout rules: one component per file, one page per file, clear routing.
- `PLATFORM_AUDIT.md`: current pass/fail status for every platform against the structure rules.
- `tools/check_platform_structure.cjs`: automated structure check for every platform.
- `design/figma/sky_planet_design_spec.md`: Figma design structure and component guidance.
- `design/figma/FIGMA_GENERATION.md`: how to generate the Figma canvas.
- `design/figma/scripts/create_basic_controls_figma.js`: Figma script for token boards, components, and a mobile preview.
- `android/view/token_mapping.md`: Java + Android View token mapping draft.
- `web/react`: React Web component package and sample.
- `web/vue`: Vue 3 Web component package and sample.
- `react-native`: React Native npm package plus runnable Expo sample app.
- `flutter/basic_controls`: Flutter package with local example app.
- `ios/BasicControls`: Swift Package with sample target.
- `migration/BASEWIDGET_SOURCE.md`: source migration note.

## Component Scope

The expanded scope follows the coverage pattern of `Digital Channel Product Line Component`, but maps all visuals back to this package's two-token-file model:

- Actions: Button, Text Link, Sticky Footer.
- Inputs: Input, Search Input, Select, Selector, Slider, Stepper, Upload / Drag and Drop.
- Selection: Checkbox, Radio, Switch / Toggle, Chip, Tag.
- Feedback: Alert, Notification, Toast, Loading, Badge, Ribbon, Coachmark, Countdown.
- Navigation: Tabs, Breadcrumbs, Pagination, Header, Bottom Navigation, Drawer.
- Surfaces: Card, Modal, Collapse / Accordion, Section Divider, Divider.
- Data display: List Item, Bullet List, Numbered List, Table, Tree, Amount / Statistic, Rating, Graph.
- Media and content: Banner, Hero Banner, Carousel, Image, Avatar / Circle Pattern, Glyph / Icon, Map, Video, Vouchers.

## Theme Rules

Components must reference semantic tokens only. Do not hardcode brand colors, borders, shadows, radius, or control sizes inside components.

The default theme is `sky_planet_day`.
