# Basic Controls React Native

React Native implementation for the Star Planet basic controls library.

## Library

- `base-widgets/src/starPlanet/index.js`
- `base-widgets/src/starPlanet/theme.js`
- `base-widgets/src/starPlanet/components/*.js`
- `base-widgets/src/starPlanet/utils/shared.js`

Package name: `@techskillplanet/basic-controls-react-native`.

## Component File Rule

React Native follows the same structure rule as the other platforms:

- one component = one JavaScript file under `base-widgets/src/starPlanet/components/`
- `index.js` only exports public APIs
- shared helpers and styles live under `utils/`
- no component implementation should be added directly to `index.js`

## Sample

- `sample-app/App.js`
- `sample-app/src/navigation/AppRouter.js`
- `sample-app/src/pages/HomePage.js`
- `sample-app/src/pages/ComponentDetailPage.js`
- `sample-app/src/pages/SettingsPage.js`
- `sample-app/src/data/componentDocs.js`

The sample is a runnable Expo React Native project. It depends on the local library exports and follows the same structure as Web, Android, iOS and Kuikly:

- Learning tab: grouped component list.
- One list item per component.
- One visual-only detail page per component.
- Settings tab: theme and language switching.
- Route state is centralized in `sample-app/src/navigation/AppRouter.js`.

Run it from the sample directory:

```bash
cd sample-app
npm install
npm run start
```
