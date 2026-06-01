# Platform Structure Audit

Audit date: 2026-05-29

The target rule is:

1. Each platform has an independent publishable library.
2. Each platform has a runnable sample project.
3. Samples depend on the local library instead of duplicating component code.
4. One component lives in one source file.
5. One sample page lives in one page file.
6. Routing is centralized and easy to scan.

## Current Result

Run:

```bash
node basic-controls/tools/check_platform_structure.cjs
```

Latest result:

| Platform | Status | Finding |
| --- | --- | --- |
| Android View | PASS | 36 component Java files. `samples` depends on `:basiccontrols`. |
| React Native | PASS | 25 component JS files, 3 sample page files, centralized `AppRouter.js`. |
| WeChat Mini Program | PASS | Has `basic-controls` library package and `pages/basic-samples` sample page. |
| Flutter | FAIL | Library and example exist, but components are still concentrated in `lib/tech_skill_planet_basic_controls.dart`. |
| iOS SwiftUI | FAIL | Swift package and sample target exist, but components are still concentrated in `BasicControls.swift`. |
| React Web | FAIL | Library and browser sample exist, but components and sample router/pages are still concentrated in `src/index.js`. |
| Vue Web | FAIL | Library and browser sample exist, but components and sample router/pages are still concentrated in `src/index.js`. |

## Build / Package Verification

Latest commands run:

| Platform | Command | Result |
| --- | --- | --- |
| Android View | `./gradlew :basiccontrols:assembleRelease :samples:assembleDebug` | PASS |
| React Native | `cd react-native/sample-app && npm run check`; `cd react-native && npm run pack:dry` | PASS |
| React Web | `cd web/react && npm run check && npm run pack:dry` | PASS |
| Vue Web | `cd web/vue && npm run check && npm run pack:dry` | PASS |
| Flutter | `cd flutter/basic_controls && flutter analyze` | PASS |
| iOS SwiftUI | `cd ios/BasicControls && swift build` | PASS |

Important distinction: build/package verification can pass while structure rules still fail. Flutter, iOS, React Web and Vue Web currently build, but still need file-level refactoring to satisfy the one-component-one-file and one-page-one-file rule.

## Required Refactor Queue

1. Flutter:
   - Move `Tsp*` widgets into `lib/src/components/tsp_*.dart`.
   - Keep `lib/tech_skill_planet_basic_controls.dart` as export-only barrel.
   - Split example into `example/lib/pages/*.dart` and `example/lib/navigation/app_router.dart`.

2. iOS SwiftUI:
   - Move each `Tsp*` view into `Sources/TechSkillPlanetBasicControls/Components/Tsp*.swift`.
   - Keep shared theme in `StarPlanetTheme.swift`.
   - Split samples into one SwiftUI page file per sample screen and a router/root sample view.

3. React Web:
   - Move each `Tsp*` function into `src/components/Tsp*.js`.
   - Keep `src/index.js` as export-only barrel.
   - Move sample into `sample/src/pages/*.js` and `sample/src/navigation/AppRouter.js`.

4. Vue Web:
   - Move each `Tsp*` component into `src/components/Tsp*.js`.
   - Keep `src/index.js` as export-only barrel.
   - Move sample into `sample/src/pages/*.js` and `sample/src/navigation/AppRouter.js`.

## Already Updated

- React Native has been restructured to the target layout.
- `PACKAGING.md` now points React Native samples to `react-native/sample-app`.
- `PLATFORM_STRUCTURE.md` defines the cross-platform rules.
