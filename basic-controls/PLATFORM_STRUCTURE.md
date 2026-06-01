# Platform Structure Rules

These rules apply to every Basic Controls implementation.

## Component Files

- One component must live in one source file.
- The component file should contain the platform class/function for that component.
- Barrel/index files may only re-export public APIs.
- Shared code belongs in a `theme`, `utils`, `styles`, or equivalent shared folder.

## Page Files

- One sample/demo page must live in one page file.
- A page file may compose multiple components, but it should not contain component implementations.
- Detail/demo pages should be route targets, not anonymous inline blocks inside a single large sample file.

## Routing

- Route definitions and route state should live in a dedicated navigation/router file.
- Page files should receive navigation callbacks through props or the platform router.
- Sample apps should make the route tree easy to scan before reading page implementation details.

## Current React Native Layout

```text
react-native/
├── base-widgets/src/starPlanet/
│   ├── components/          # one component per JS file
│   ├── utils/               # shared helpers and styles
│   ├── theme.js
│   └── index.js             # exports only
└── sample-app/
    ├── App.js
    └── src/
        ├── navigation/      # route state and route switching
        ├── pages/           # one page per JS file
        └── data/            # component docs and grouping
```

## Other Platform Mapping

- Android View: one Java class per component, one Activity/Fragment/View page per sample screen.
- iOS Swift: one Swift type per component, one SwiftUI/UIKit view file per sample page.
- Flutter: one Dart widget file per component, one Dart page file per sample page.
- Web React/Vue: one component file per component, one route/page file per sample page.
