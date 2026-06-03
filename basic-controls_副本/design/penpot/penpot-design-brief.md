# Penpot Design Brief

## Target

- File: https://design.penpot.app/#/workspace?team-id=e7a86fff-661d-81c1-8008-103779d6d184&file-id=e7a86fff-661d-81c1-8008-10381337624c&page-id=e7a86fff-661d-81c1-8008-10381337624d
- Product: TechFun Planet Basic Controls
- Platform: Android Java View + XML, no Compose
- Visual direction: animal-island-ui inspired organic controls, recolored into 技趣星球 sky planet theme

## Pages

1. `00 Tokens`: color, typography, radius, spacing, motion and component size boards.
2. `01 Components`: editable Penpot components and variants.
3. `02 Android View Mapping`: Java class, XML attrs, state strategy, token usage.
4. `03 Theme Preview`: light/day theme preview screen.
5. `04 Samples Preview`: visual parity with Android Samples app.

## Component Coverage

| Android class | Penpot component | Required states |
|---|---|---|
| `BasicButton` | Button | primary/default/danger/text/link/disabled/pressed |
| `BasicInputView` | Input | focus/error/disabled |
| `BasicSwitchView` | Switch | small/default, checked/loading/disabled |
| `BasicCheckboxView` | Checkbox | checked/unchecked/disabled |
| `BasicRadioView` | Radio | checked/unchecked/disabled |
| `BasicSelectView` | Select | trigger/menu/selected option |
| `BasicTabsView` | Tabs | selected/default |
| `BasicCardView` | Card | cloud surface / organic radius |
| `BasicAlertView` | Alert | info/success/warning/error |
| `BasicBadgeView` | Badge | status/count |
| `BasicChipView` | Chip | selected/removable |
| `BasicListItemView` | List Item | title/subtitle/action |
| `BasicProgressView` | Progress | linear status progress |
| `BasicLoadingView` | Loading | inline loading |
| `BasicPlanetLoadingView` | Planet Loading | sky planet animated loader |
| `BasicLoadingDialog` | Loading Dialog | translucent modal loading |
| `BasicRefreshLayout` | Refresh Layout | pull refresh / load more |
| `BasicToast` | Toast | custom transient message |
| `BasicEmptyView` | Empty | empty state |
| `BasicDividerView` | Divider | solid/dashed section divider |
| `BasicCollapseView` | Collapse | expanded/collapsed |
| `BasicModalDialog` | Modal | dialog header/body/actions |
| `BasicTableView` | Table | header/rows/cells |
| `BasicCodeBlockView` | Code Block | mono surface |
| `BasicTypewriterView` | Typewriter | text animation |

## Token Sync Rules

- `color_token.json` owns color meaning and state semantics.
- `style_token.json` owns size, radius, spacing, typography, opacity and motion.
- Penpot token names should keep the dot path names, such as `semantic.control.switch.onBackground`.
- Android runtime should keep using `BasicThemeManager`, `BasicColors`, `BasicStyle` and `BasicTokenResolver`.

## Color Tokens

| Token | Value / Reference |
|---|---|
| `primitive.sky.pageEnd` | `#F9FDFF` |
| `primitive.sky.pageMist` | `#F4FBFF` |
| `primitive.sky.brandSubtle` | `#E5F6FF` |
| `primitive.sky.pageStart` | `#DDF4FF` |
| `primitive.sky.borderSoft` | `#C8EAFF` |
| `primitive.sky.brandHover` | `#8BD5FF` |
| `primitive.sky.brandPrimary` | `#31A8FF` |
| `primitive.sky.brandPressed` | `#1479D6` |
| `primitive.cloud.white` | `#FFFFFF` |
| `primitive.cloud.surface` | `#FEFFFF` |
| `primitive.cloud.soft` | `#F6FBFF` |
| `primitive.cloud.border` | `#E4F5FF` |
| `primitive.cloud.mist` | `#D8F0FF` |
| `primitive.sun.highlightSoft` | `#FFE79A` |
| `primitive.sun.highlight` | `#FFD166` |
| `primitive.sun.soft` | `#FFF7D7` |
| `primitive.aurora.successHover` | `#70E5DE` |
| `primitive.aurora.success` | `#43CFC7` |
| `primitive.aurora.successPressed` | `#16A9A1` |
| `primitive.coral.dangerHover` | `#FF8A95` |
| `primitive.coral.danger` | `#FF6B7A` |
| `primitive.coral.dangerPressed` | `#E24C5C` |
| `primitive.ink.textTertiary` | `#7895AE` |
| `primitive.ink.textSecondary` | `#365D82` |
| `primitive.ink.textPrimary` | `#173A62` |
| `primitive.ink.textStrong` | `#0F2A49` |
| `primitive.neutral.white` | `#FFFFFF` |
| `primitive.neutral.black` | `#000000` |
| `primitive.neutral.scrimBlue` | `#173A6259` |
| `primitive.neutral.transparent` | `#00000000` |
| `semantic.brand.primary` | `{primitive.sky.brandPrimary}` |
| `semantic.brand.primaryHover` | `{primitive.sky.brandHover}` |
| `semantic.brand.primaryActive` | `{primitive.sky.brandPressed}` |
| `semantic.brand.primarySubtle` | `{primitive.sky.brandSubtle}` |
| `semantic.status.success` | `{primitive.aurora.success}` |
| `semantic.status.successHover` | `{primitive.aurora.successHover}` |
| `semantic.status.successActive` | `{primitive.aurora.successPressed}` |
| `semantic.status.warning` | `{primitive.sun.highlight}` |
| `semantic.status.warningHover` | `{primitive.sun.highlightSoft}` |
| `semantic.status.warningActive` | `{primitive.sun.highlight}` |
| `semantic.status.danger` | `{primitive.coral.danger}` |
| `semantic.status.dangerHover` | `{primitive.coral.dangerHover}` |
| `semantic.status.dangerActive` | `{primitive.coral.dangerPressed}` |
| `semantic.text.primary` | `{primitive.ink.textPrimary}` |
| `semantic.text.secondary` | `{primitive.ink.textSecondary}` |
| `semantic.text.tertiary` | `{primitive.ink.textTertiary}` |
| `semantic.text.inverse` | `{primitive.neutral.white}` |
| `semantic.text.disabled` | `{primitive.ink.textTertiary}` |
| `semantic.text.dialogTitle` | `{primitive.ink.textPrimary}` |
| `semantic.text.dialogBody` | `{primitive.ink.textSecondary}` |
| `semantic.background.page` | `{primitive.sky.pageStart}` |
| `semantic.background.pageGradientEnd` | `{primitive.sky.pageEnd}` |
| `semantic.background.surface` | `{primitive.cloud.surface}` |
| `semantic.background.surfaceRaised` | `{primitive.cloud.white}` |
| `semantic.background.surfaceSubtle` | `{primitive.cloud.soft}` |
| `semantic.background.surfaceDisabled` | `{primitive.cloud.border}` |
| `semantic.background.menu` | `{primitive.cloud.white}` |
| `semantic.background.modalScrim` | `{primitive.neutral.scrimBlue}` |
| `semantic.border.default` | `{primitive.sky.borderSoft}` |
| `semantic.border.light` | `{primitive.cloud.border}` |
| `semantic.border.control` | `{primitive.sky.borderSoft}` |
| `semantic.border.focus` | `{primitive.sky.brandPrimary}` |
| `semantic.border.warning` | `{primitive.sun.highlight}` |
| `semantic.border.danger` | `{primitive.coral.danger}` |
| `semantic.control.button.defaultBackground` | `{primitive.cloud.white}` |
| `semantic.control.button.defaultText` | `{primitive.ink.textPrimary}` |
| `semantic.control.button.primaryBackground` | `{primitive.sky.brandPrimary}` |
| `semantic.control.button.primaryText` | `{primitive.neutral.white}` |
| `semantic.control.button.raisedShadow` | `{primitive.sky.borderSoft}` |
| `semantic.control.checkbox.background` | `{primitive.cloud.surface}` |
| `semantic.control.checkbox.checkedBackground` | `{primitive.sky.brandPrimary}` |
| `semantic.control.radio.checkedDot` | `{primitive.sky.brandPrimary}` |
| `semantic.control.switch.offBackground` | `{primitive.cloud.border}` |
| `semantic.control.switch.offBorder` | `{primitive.sky.borderSoft}` |
| `semantic.control.switch.offText` | `{primitive.ink.textSecondary}` |
| `semantic.control.switch.onBackground` | `{primitive.sky.brandHover}` |
| `semantic.control.switch.onBorder` | `{primitive.sky.brandPrimary}` |
| `semantic.control.switch.onText` | `{primitive.neutral.white}` |
| `semantic.control.switch.handleBackground` | `{primitive.cloud.surface}` |
| `semantic.control.switch.handleBorder` | `{primitive.sky.borderSoft}` |
| `semantic.control.switch.handleCheckedBorder` | `{primitive.sky.brandPrimary}` |
| `semantic.control.switch.loadingSpinner` | `{primitive.sky.brandPrimary}` |
| `semantic.control.select.selectedOptionBackground` | `{primitive.sky.brandSubtle}` |
| `semantic.control.loading.stripePrimary` | `{primitive.sky.brandHover}` |
| `semantic.control.loading.stripeSecondary` | `{primitive.aurora.success}` |
| `semantic.control.loading.border` | `{primitive.sky.borderSoft}` |

## Style Highlights

| Token | Value |
|---|---|
| `radius.controlIsland` | `22` |
| `radius.cardOrganic` | `28` |
| `radius.dialogOrganic` | `36` |
| `size.switch.md.width` | `52` |
| `size.switch.md.height` | `28` |
| `motion.switch.duration` | `180` |
| `border.width.switch` | `2.5` |

## Penpot Build Notes

- Use component variants for visible states rather than duplicating unrelated frames.
- Use token names as layer labels where Penpot token binding is not available.
- Keep loading, refresh and switch animations documented with motion tokens even when the Penpot static frame cannot animate them directly.
- Preserve the Android class name in each component description to simplify later code/design sync.
