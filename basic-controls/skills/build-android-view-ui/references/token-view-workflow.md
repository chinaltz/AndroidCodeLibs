# Token-Driven Android View Workflow

## Target Structure

Use this structure when creating a standalone component library:

```text
android/basiccontrols/
├── settings.gradle
├── build.gradle
├── basiccontrols/
│   ├── build.gradle
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── assets/theme/color_token.json
│       ├── assets/theme/style_token.json
│       ├── java/<package>/theme/
│       ├── java/<package>/drawable/
│       ├── java/<package>/widget/
│       └── res/values/attrs.xml
└── samples/
    ├── build.gradle
    └── src/main/java/<sample-package>/MainActivity.java
```

## Token Naming

Use stable semantic names that explain purpose:

- Good: `semantic.control.button.primaryBackground`
- Good: `semantic.control.switch.handleCheckedBorder`
- Good: `size.switch.md.handle`
- Good: `motion.switch.duration`
- Avoid: `blue.500`, `gray.100`, `switchColor1`

Primitive tokens describe brand language. Semantic tokens describe UI usage.

## Android Runtime Mapping

Map JSON into typed runtime classes:

- `BasicColors`: resolved `int` colors.
- `BasicStyle`: resolved px/sp/duration/opacity values.
- `BasicTokenResolver`: path lookup, `{primitive.xxx}` reference resolution, color parsing, dp/sp conversion.
- `BasicThemeManager`: `init(Context)` and cached `colors()` / `style()`.

Components should call `BasicThemeManager.colors()` and `BasicThemeManager.style()` only. They should not parse JSON.

## Component Checklist

For each component:

- Public Java class in `widget/`.
- Chinese Javadoc for public class and public methods.
- Token-backed background, text, border, size, and motion.
- `refreshTheme()` applies current runtime theme.
- XML attrs if useful: `basicVariant`, `basicText`, `basicTitle`, `basicMessage`, `basicSelected`, `basicDisabled`.
- Samples coverage for normal, selected/focused, disabled, loading/error states as applicable.

## Animation Checklist

For custom animated Views:

- Use `ValueAnimator` or `ObjectAnimator`.
- Start in `onAttachedToWindow`.
- Stop and null out in `onDetachedFromWindow`.
- Keep duration and colors token-backed when themeable.
- Prefer Canvas for simple themed animation instead of static image assets.

## Switch Coverage Checklist

Animal-island-ui parity for Switch means:

- `checked` state via selected/isChecked.
- default/controlled-like state via Java setter.
- `small` and `default` size.
- `disabled`.
- `loading` blocks click and shows spinner.
- checked/unchecked inner text.
- state change callback.
- track background and border tokens.
- handle background and checked border tokens.
- inner text size token.
- handle motion duration token.
- loading/disabled opacity tokens.

## Samples Checklist

Samples should be a real app module:

- `com.android.application`.
- Depends on the library module.
- Has launcher Activity.
- Calls `BasicThemeManager.init(this)`.
- Shows all components and state combinations on first screen or a scrollable page.
- Builds with `:samples:assembleDebug`.

## Figma Alignment

When Figma files/scripts exist:

- Keep page count within Figma Starter limits when needed.
- Use the same token keys from JSON in Figma generation scripts.
- Document failed MCP sync attempts instead of blocking Android code generation.
- Prefer meaningful token names over shade scales so skinning can happen by replacing JSON values.
