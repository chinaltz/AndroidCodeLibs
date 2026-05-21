# Android View Token Mapping Draft

This package targets the classic Android View system first: Java, XML layouts, custom `View`, `Drawable`, and style resources.

Compose is intentionally out of scope for the first implementation pass.

## Suggested Structure

```text
app/src/main/assets/theme/color_token.json
app/src/main/assets/theme/style_token.json
ui/basiccontrols/theme/BasicThemeManager.java
ui/basiccontrols/theme/BasicColors.java
ui/basiccontrols/theme/BasicStyle.java
ui/basiccontrols/widget/BasicButton.java
ui/basiccontrols/widget/BasicInputView.java
ui/basiccontrols/widget/BasicSearchInputView.java
ui/basiccontrols/widget/BasicSelectView.java
ui/basiccontrols/widget/BasicCardView.java
ui/basiccontrols/widget/BasicModalDialog.java
ui/basiccontrols/widget/BasicAlertView.java
ui/basiccontrols/widget/BasicToast.java
ui/basiccontrols/widget/BasicTabsView.java
ui/basiccontrols/widget/BasicTableView.java
ui/basiccontrols/widget/BasicUploadView.java
res/drawable/basic_*.xml
res/values/basic_colors.xml
res/values/basic_dimens.xml
```

## Runtime Theme Objects

```java
public final class BasicColors {
    public final int brandPrimary;
    public final int brandPrimaryHover;
    public final int brandPrimaryActive;
    public final int brandPrimarySubtle;
    public final int textPrimary;
    public final int textSecondary;
    public final int textDisabled;
    public final int backgroundPage;
    public final int backgroundSurface;
    public final int backgroundSurfaceRaised;
    public final int backgroundSurfaceSubtle;
    public final int borderDefault;
    public final int borderLight;
    public final int borderFocus;
    public final int danger;
    public final int warning;
    public final int success;
}

public final class BasicStyle {
    public final float radiusSm;
    public final float radiusMd;
    public final float radiusLg;
    public final float radiusXl;
    public final float radiusPill;
    public final float borderDefault;
    public final float borderHairline;
    public final float controlHeightSm;
    public final float controlHeightMd;
    public final float controlHeightLg;
    public final float spaceSm;
    public final float spaceMd;
    public final float spaceLg;
    public final float textSm;
    public final float textMd;
    public final float textLg;
    public final float dialogTitle;
}
```

## Theme Manager

```java
public final class BasicThemeManager {
    private static BasicColors colors;
    private static BasicStyle style;

    public static void init(Context context) {
        // Parse assets/theme/color_token.json and style_token.json.
        // Resolve semantic token references once, then cache runtime objects.
    }

    public static BasicColors colors() {
        if (colors == null) throw new IllegalStateException("BasicThemeManager.init() first");
        return colors;
    }

    public static BasicStyle style() {
        if (style == null) throw new IllegalStateException("BasicThemeManager.init() first");
        return style;
    }
}
```

## Drawable Strategy

Classic View components should create backgrounds with `GradientDrawable` and `StateListDrawable`.

```java
public static Drawable roundedFillStroke(
    int fillColor,
    int strokeColor,
    float strokeWidthPx,
    float radiusPx
) {
    GradientDrawable drawable = new GradientDrawable();
    drawable.setShape(GradientDrawable.RECTANGLE);
    drawable.setColor(fillColor);
    drawable.setStroke(Math.round(strokeWidthPx), strokeColor);
    drawable.setCornerRadius(radiusPx);
    return drawable;
}
```

Use this for Button, Input, Card, Select trigger, and Dialog panels.

## Component Mapping

### BasicButton

- Extends `AppCompatTextView` or `FrameLayout`.
- Uses `StateListDrawable` for enabled / pressed / disabled states.
- Primary: `control.buttonPrimaryBg`, white text, pill radius.
- Default: `control.buttonDefaultBg`, `border.control`, `text.primary`.
- Pressed state: reduce translationY or shadow offset.

### BasicInputView

- Extends `LinearLayout` or `FrameLayout`.
- Contains `EditText`, optional prefix/suffix icons, clear button.
- Background uses white fill + light-blue stroke.
- Focus state swaps stroke to `border.focus`.

### BasicCardView

- Extends `FrameLayout`.
- Background: cloud white fill, light-blue border, 24/30 radius.
- Elevation should be subtle; prefer `ViewCompat.setElevation()` only where needed.

### BasicModalDialog

- Use `DialogFragment` or `Dialog`.
- Dialog panel: white cloud card, 36 radius, light-blue border.
- Scrim: blue-black overlay from `background.modalScrim`.

### BasicSwitch / BasicCheckbox

- Prefer custom `Drawable` states first.
- Only create custom `View` when animation or shape requires it.

### Expanded Java View Mapping

| Component | Suggested Android View implementation |
|-----------|----------------------------------------|
| BasicTextLink | `AppCompatTextView` with tokenized text color and pressed alpha |
| BasicStickyFooter | `FrameLayout` / `LinearLayout` pinned by screen layout, contains Button slots |
| BasicSearchInputView | `LinearLayout` with search icon slot, `EditText`, clear action |
| BasicSelectView | `FrameLayout` trigger + `PopupWindow` menu |
| BasicSelectorView | `LinearLayout` segmented option group |
| BasicSliderView | `SeekBar` first; custom `View` only for custom track/tooltip |
| BasicStepperView | `LinearLayout` minus button, value text, plus button |
| BasicUploadView | `FrameLayout` drop zone / image picker entry |
| BasicRadioView | `RadioButton` with tokenized button drawable |
| BasicChipView | `TextView` / `LinearLayout` pill with optional close icon |
| BasicTagView | `TextView` static status label |
| BasicAlertView | `LinearLayout` message block, icon slot, action slot |
| BasicNotificationView | `LinearLayout` larger alert with title/body/action |
| BasicToast | `Toast` custom view or lightweight overlay view |
| BasicBadgeView | `TextView` count/status badge |
| BasicRibbonView | `TextView` or custom drawable for corner/inline ribbon |
| BasicCoachmarkView | `PopupWindow` / overlay view with arrow |
| BasicCountdownView | `TextView` with timer formatting |
| BasicBreadcrumbsView | `HorizontalScrollView` + text link chain |
| BasicPaginationView | `LinearLayout` page buttons |
| BasicHeaderView | `FrameLayout` top app bar with title and action slots |
| BasicBottomNavigationView | `LinearLayout` 3-5 navigation items |
| BasicDrawerView | `Dialog` / bottom sheet style container |
| BasicListItemView | `LinearLayout` title/subtitle/leading/trailing slots |
| BasicTableView | `RecyclerView` or `HorizontalScrollView` + row views |
| BasicTreeView | `RecyclerView` with depth indentation |
| BasicAmountView | `LinearLayout` large value/unit/trend |
| BasicRatingView | `LinearLayout` star or score indicators |
| BasicGraphView | chart container placeholder; integrate chart library later if needed |
| BasicBannerView | `FrameLayout` image/color background plus CTA slots |
| BasicCarouselView | `ViewPager2` / `RecyclerView` horizontal pager |
| BasicAvatarView | `ImageView` / `TextView` circle fallback |

## Rules

- No naked hex colors in Java classes.
- No naked dp/sp values in widget code.
- Load tokens into runtime objects first, then map them into drawables and text styles.
- Figma component names should match Java class names where possible: `BasicButton`, `BasicInputView`, `BasicCardView`, `BasicModalDialog`, `BasicAlertView`, `BasicTabsView`, `BasicTableView`.
