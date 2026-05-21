# Basic Controls Figma Design Spec

## Goal

Create a reusable Android native View basic component system for 技趣星球.

The first engineering target is Java + XML + classic Android View. Compose is intentionally not part of the first implementation pass.

The design language is `Sky Planet`: bright blue sky, white cloud surfaces, soft light-blue borders, rounded controls, clean reading density, and a friendly optimistic mood.

This replaces the old Animal Island skin while keeping the original BaseWidget token architecture.

## Token Files

- `design/tokens/color_token.json`: color primitives and semantic tokens.
- `design/tokens/style_token.json`: radius, size, border, typography, spacing, shadow, and motion tokens.

Components must only reference semantic token keys.

## Figma Pages

1. `00 Tokens`
   - Sky / cloud / sun / aurora / coral / ink palettes.
   - Semantic colors: brand, status, text, background, border, control.
   - Radius, spacing, control height, typography, shadow samples.
2. `01 Components + Android View Mapping`
   - Full component catalogue plus Java class names, XML usage, Drawable/state-list mapping notes.
   - Kept as one page because Figma Starter files are limited to 3 pages.
3. `02 Theme Preview`
   - 390x844 Android mobile frame showing a realistic component dashboard.

## Visual Rules

- Page background: sky blue to near-white gradient with soft cloud shapes.
- Surfaces: white or cloud white.
- Borders: light blue, usually 2px for outer card/control borders and 1px for table or internal lines.
- Shadows: soft sky shadows, avoid heavy dark shadows.
- Main action: sky blue button with white text.
- Highlights: sunshine yellow underline or small chip only.
- Avoid: purple gradients, dark sci-fi panels, beige/brown island palette, complex game-like decoration.

## Components

Reference coverage: `Digital Channel Product Line Component` includes a broad product component set: Alert, Accordion, Amount, Banner, Breadcrumbs, Button, Badge, Calendar, Card, Carousel, Chip, Drawer, Form, Graph, List Item, Modal, Navigation, Notification, Pagination, Table, Tabs, Toast, Toggle, Upload, and more. Basic Controls should not copy that visual theme. It should use the same breadth as a checklist, then render everything with Sky Planet semantic tokens.

### Component Groups

| Group | Components |
|------|------------|
| Actions | Button, Text Link, Sticky Footer |
| Inputs | Input, Search Input, Select, Selector, Slider, Stepper, Upload / Drag and Drop |
| Selection | Checkbox, Radio, Switch / Toggle, Chip, Tag |
| Feedback | Alert, Notification, Toast, Loading, Badge, Ribbon, Coachmark, Countdown |
| Navigation | Tabs, Breadcrumbs, Pagination, Header, Bottom Navigation, Drawer |
| Surfaces | Card, Modal, Collapse / Accordion, Section Divider, Divider |
| Data Display | List Item, Bullet List, Numbered List, Table, Tree, Amount / Statistic, Rating, Graph |
| Media / Content | Banner, Hero Banner, Carousel, Image, Avatar / Circle Pattern, Glyph / Icon, Map, Video, Vouchers |

### Button

- Variants: default, primary, dashed, text, link, danger, ghost.
- Sizes: sm 32, md 45, lg 48.
- States: enabled, pressed, disabled, loading, block, icon.
- Visual: pill radius, 2px light-blue border, soft cloud-lift shadow.
- Primary: sky blue background, white text.

### Input

- Variants: default, prefix, suffix, clearable, error, warning, disabled.
- Sizes: sm, md, lg.
- Visual: white background, light-blue border, radius 18/24, focus uses sky blue.

### Select

- Trigger uses Input style.
- Menu uses white cloud surface, radius 28, light-blue border.
- Selected option uses pale sky-blue pill.

### Checkbox

- Sizes: sm 18, md 22, lg 28.
- Checked state uses sky blue fill and white check.

### Switch

- Off uses pale cloud border/background.
- On uses sky-blue track and white handle.

### Card

- Variants: plain, title, interactive, selected.
- Background: cloud white or pale sky.
- Border: 2px light-blue.
- Radius: 24/30.
- Shadow: cloud-lift + soft sky shadow.

### Modal

- Use white cloud card, 36px radius fallback.
- Scrim should be blue-black overlay, not pure black if possible.
- Footer uses primary + secondary buttons.

### Collapse / Accordion

- FAQ card with round sky icon.
- Expanded body line-height should stay relaxed.

### Tabs

- Pill or underline.
- Active state: sky blue or pale sky-blue fill.

### Divider

- Line, dashed, or cloud wave. Use light blue.

### Loading

- Spinner or striped loading uses sky blue + aurora cyan.

### Alert / Notification / Toast

- Alert: inline or card-style feedback. Variants: info, success, warning, error.
- Notification: larger message container with title, body, optional action.
- Toast: transient bottom message with compact height and dark sky text/background contrast.

### Badge / Tag / Chip / Ribbon

- Badge: small count/status marker, usually 18-22dp high.
- Tag: static label for category/status.
- Chip: selectable pill with optional close icon.
- Ribbon: corner or inline highlight for promotions and labels.

### Breadcrumbs / Pagination / Navigation

- Breadcrumbs: compact text-link chain for deep paths.
- Pagination: page number controls and next/previous buttons.
- Header: native top bar with title, back icon area, action slots.
- Bottom Navigation: 3-5 items, icon plus label, active state sky blue.
- Drawer: bottom sheet or side panel using surface raised token and modal scrim.

### Data Display

- List Item: title, subtitle, leading/trailing slots.
- Bullet List / Numbered List: content blocks with semantic text spacing.
- Table: header, row, selected row, zebra row, checkbox/radio cell variants.
- Tree: indented expandable list; arrow indicator uses icon token sizes.
- Amount / Statistic: large number, unit, caption, trend indicator.
- Rating: star/score display using sun accent token.
- Graph: tokenized placeholder for chart containers, legends, axes, and empty states.

### Media / Content

- Banner / Hero Banner / Carousel: image or color surface with title, subtitle, CTA slot.
- Image: ratio containers, loading, error, rounded variants.
- Avatar / Circle Pattern: initials or image, sizes sm/md/lg.
- Glyph / Icon: icon container and illustration placeholder.
- Map / Video / Vouchers: framed content modules for product scenarios.

## Figma Variable Naming

- Color primitive: `color/primitive/sky/500`
- Color semantic: `color/semantic/brand/primary`
- Space: `space/4`
- Radius: `radius/pill`
- Size: `size/control-height/md`
- Font size: `font/size/md`
- Border width: `border/width/default`
- Motion: `motion/duration/base`

## First Screen Recommendation

Create a 390x844 Android mobile frame:

- Background: `background.page`.
- Header: `Basic Controls` with subtitle `Sky Planet tokens`.
- Search Input.
- Component cards: Button, Input, Select, Modal, Switch, Checkbox.
- Bottom primary button: `Open modal`.
- Modal example: title `Sky Notice`, body `Tokens are ready for Figma and classic Android View.`
