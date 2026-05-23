---
name: build-android-view-ui
description: Build or extend a token-driven Android component library using Java, XML, and the traditional Android View system. Use when Codex needs to create reusable Android View UI components, theme them from color_token.json and style_token.json, keep Android and Figma implementations aligned, add Samples/demo apps, or migrate this Basic Controls UI work into another repository without Compose or Kotlin.
---

# Build Android View UI

## Core Rule

Build with Java + Android View only. Do not introduce Compose, Kotlin, AppCompat, Material, or hidden external UI dependencies unless the user explicitly asks for them.

Use two JSON files as the source of visual truth:

- `color_token.json`: primitive colors plus semantic component/state colors.
- `style_token.json`: radius, spacing, typography, component sizes, border widths, opacity, motion, and shadow values.

Load [references/token-view-workflow.md](references/token-view-workflow.md) when implementing or migrating a component library.

## Workflow

1. Inspect the target repo before writing code.
   - Find Gradle structure, package names, min/compile SDK, existing token files, and any existing Samples/demo app.
   - Preserve the repo's conventions and avoid unrelated refactors.

2. Establish token infrastructure first.
   - Keep token keys meaningful and semantic, e.g. `semantic.control.switch.onBackground`, not numeric shade names.
   - Add or extend Java runtime models such as `BasicColors`, `BasicStyle`, `BasicThemeManager`, and a resolver for JSON references.
   - Resolve `{primitive.xxx}` references at initialization time so component code never reads raw JSON paths.

3. Implement components as reusable Views.
   - Public classes and public methods need concise Chinese Javadoc.
   - Component code should read from runtime token classes, not hardcode theme colors.
   - Expose a small common API when useful:
     - `setVariant(String variant)`
     - `setBasicText(CharSequence text)`
     - `setSelectedState(boolean selected)`
     - `setBasicDisabled(boolean disabled)`
     - `refreshTheme()`

4. Keep Figma and Android aligned.
   - When adding a component token, add it to both source token JSON and Android assets.
   - Use the same semantic names Figma generation scripts can consume.
   - Prefer token additions over one-off Java constants when a visual value is themeable.

5. Add or update a runnable Samples app.
   - Samples should depend on the library module and cover all component states.
   - Use programmatic Java Views when speed matters; XML samples are optional unless requested.
   - Include real scenarios: default, selected, disabled, loading, error, success, warning, empty, refresh/load-more.

6. Validate.
   - Parse both token JSON files.
   - Run Gradle assemble for the library and Samples.
   - Search for accidental Compose/Kotlin/AppCompat/Material dependencies.
   - Report any unavoidable platform warnings, e.g. custom Toast deprecated API.

## Component Standards

Prefer this architecture:

- `theme/`: token parsing and typed runtime models.
- `drawable/`: `GradientDrawable`, `StateListDrawable`, and common shape factories.
- `widget/`: public View components.
- `samples/`: runnable Android application for manual visual review.

For interaction-heavy components:

- Use Android state (`enabled`, `selected`, `pressed`, `focused`) where it maps cleanly.
- For animated custom views, stop animators in `onDetachedFromWindow`.
- Keep animation colors, durations, sizes, opacity, and dimensions token-driven.
- Avoid image assets for simple spinners or planets; draw with Canvas when feasible.

## Visual Direction

Use the 技趣星球 / Sky Planet style:

- Blue-sky brand primary.
- Cloud-like raised surfaces.
- Organic rounded cards/dialogs.
- Island-style lifted controls.
- Soft borders and playful motion.
- State colors: aurora success, sun warning, coral danger.

When referencing animal-island-ui:

- Preserve the interaction language: chunky borders, rounded shapes, handle/track motion, loading spinner, and playful affordances.
- Recolor through Sky Planet tokens rather than copying beige/brown source colors.

## Public API Bias

Expose small Java APIs instead of forcing app code into subclassing.

For switch-like components, include:

- `setCheckedText(CharSequence)`
- `setUncheckedText(CharSequence)`
- `setLoading(boolean)`
- `isChecked()`
- `toggle()`
- `setOnCheckedChangeListener(...)`

For refresh/load components, include:

- `setContentView(View)`
- `setOnRefreshLoadListener(...)`
- `finishRefresh()`
- `finishLoadMore()`

For modal loading:

- Provide a static `show(Context, CharSequence)` convenience method.
- Keep the dialog dismissible behavior explicit and documented.

## Verification Commands

Adapt paths to the target repo:

```bash
node -e "JSON.parse(require('fs').readFileSync('path/to/color_token.json','utf8')); JSON.parse(require('fs').readFileSync('path/to/style_token.json','utf8')); console.log('token json ok')"
./gradlew :basiccontrols:assemble
./gradlew :samples:assembleDebug
rg -n "Compose|compose|kotlin|org.jetbrains|androidx|material" path/to/android -g '!**/build/**' -g '!**/.gradle/**'
```

If the target repo has no wrapper but a local Gradle cache exists, use the available Gradle binary and say exactly what was used.
