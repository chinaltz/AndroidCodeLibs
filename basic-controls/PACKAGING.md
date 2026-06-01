# TechSkillPlanet Basic Controls Packaging

This repository keeps every platform in the same pattern:

- Library code is publishable and does not depend on sample applications.
- Samples depend on the local library and are used only for visual/API coverage.
- Public component names use the `Tsp` prefix.
- Android/Kotlin package names use `com.techskillplanet`.

## Package Matrix

| Platform | Library | Sample | Package name |
| --- | --- | --- | --- |
| Android View | `android/basiccontrols/basiccontrols` | `android/basiccontrols/samples` | `com.techskillplanet:basic-controls-android:0.1.0` |
| Android phonics app | `android/basiccontrols/basiccontrols` | `android/basiccontrols/phonicsapp` | App module, not published |
| Kuikly | `android/basiccontrols/kuikly/shared/src/commonMain/kotlin/com/techskillplanet/phonics/controls` | `android/basiccontrols/kuikly/shared/src/commonMain/kotlin/com/techskillplanet/phonics/samples` | `com.techskillplanet.phonics:shared` |
| WeChat Mini Program | `android/basiccontrols/miniprogram/basic-controls` | `android/basiccontrols/miniprogram/pages/basic-samples` | `@techskillplanet/basic-controls-miniprogram` |
| iOS SwiftUI | `ios/BasicControls/Sources/TechSkillPlanetBasicControls` | `ios/BasicControls/Samples` | `TechSkillPlanetBasicControls` Swift package |
| Flutter | `flutter/basic_controls/lib` | `flutter/basic_controls/example` | `tech_skill_planet_basic_controls` |
| React Web | `web/react/src` | `web/react/sample` | `@techskillplanet/basic-controls-react` |
| Vue Web | `web/vue/src` | `web/vue/sample` | `@techskillplanet/basic-controls-vue` |
| React Native | `react-native/base-widgets/src/starPlanet` | `react-native/sample-app` | `@techskillplanet/basic-controls-react-native` |

## Local Verification

```bash
# Web packages
cd web/react && npm run check && npm run pack:dry
cd ../vue && npm run check && npm run pack:dry

# Android View library + sample compile
cd android/basiccontrols && ./gradlew :basiccontrols:assembleRelease :samples:compileDebugJavaWithJavac

# Kuikly shared library
cd android/basiccontrols/kuikly && ./gradlew :shared:compileKotlinJs

# iOS Swift package
cd ios/BasicControls && swift build

# Flutter package
cd flutter/basic_controls && flutter analyze

# React Native package manifest
cd react-native && npm run pack:dry
cd react-native/sample-app && npm run check
```

## Open Source Boundary

Before publishing, keep only the library package and its sample/documentation in each platform folder. Build caches, IDE state, generated bundles and app-private assets should not be shipped.

Recommended exclusions:

- `**/build/`
- `**/.gradle/`
- `**/.dart_tool/`
- `**/.build/`
- `**/node_modules/`
- Mini Program private `project.private.config.json`
- Generated Kuikly mini app `dist/` unless it is explicitly released as an artifact

## API Consistency Rule

Every new component must be added in this order:

1. Update the shared component contract and coverage document.
2. Implement the library component for each target.
3. Add a visual-only sample page/list entry for each target.
4. Run the verification commands above.
