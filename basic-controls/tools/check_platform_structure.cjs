const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function files(relativePath, predicate = () => true) {
  const dir = path.join(root, relativePath);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => fs.statSync(path.join(dir, name)).isFile()).filter(predicate);
}

function recursiveFiles(relativePath, predicate = () => true) {
  const dir = path.join(root, relativePath);
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const walk = current => {
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (predicate(full)) out.push(path.relative(root, full));
    }
  };
  walk(dir);
  return out;
}

function status(ok, note) {
  return { ok, note };
}

const checks = [
  {
    platform: 'Android View',
    library: 'android/basiccontrols/basiccontrols',
    sample: 'android/basiccontrols/samples',
    result() {
      const componentCount = recursiveFiles('android/basiccontrols/basiccontrols/src/main/java/com/techskillplanet/basiccontrols/widget', f => /Basic.+\.java$/.test(f)).length;
      const sampleDependsOnLibrary = fs.readFileSync(path.join(root, 'android/basiccontrols/samples/build.gradle'), 'utf8').includes('implementation project(":basiccontrols")');
      return status(componentCount >= 25 && sampleDependsOnLibrary, `${componentCount} component Java files; samples depends on :basiccontrols=${sampleDependsOnLibrary}`);
    },
  },
  {
    platform: 'React Native',
    library: 'react-native/base-widgets/src/starPlanet',
    sample: 'react-native/sample-app',
    result() {
      const componentCount = files('react-native/base-widgets/src/starPlanet/components', f => /^Tsp.+\.js$/.test(f)).length;
      const pageCount = files('react-native/sample-app/src/pages', f => f.endsWith('.js')).length;
      const hasRouter = exists('react-native/sample-app/src/navigation/AppRouter.js');
      return status(componentCount >= 25 && pageCount >= 3 && hasRouter, `${componentCount} component JS files; ${pageCount} sample page files; router=${hasRouter}`);
    },
  },
  {
    platform: 'Flutter',
    library: 'flutter/basic_controls/lib',
    sample: 'flutter/basic_controls/example',
    result() {
      const componentFiles = files('flutter/basic_controls/lib/src/components', f => /^tsp_.*\.dart$/.test(f)).length;
      const hasLocalDependency = fs.readFileSync(path.join(root, 'flutter/basic_controls/example/pubspec.yaml'), 'utf8').includes('path: ..');
      return status(componentFiles >= 25 && hasLocalDependency, `${componentFiles} component Dart files; example depends on local package=${hasLocalDependency}`);
    },
  },
  {
    platform: 'iOS SwiftUI',
    library: 'ios/BasicControls/Sources/TechSkillPlanetBasicControls',
    sample: 'ios/BasicControls/Samples',
    result() {
      const componentFiles = files('ios/BasicControls/Sources/TechSkillPlanetBasicControls/Components', f => /^Tsp.+\.swift$/.test(f)).length;
      const manifest = fs.readFileSync(path.join(root, 'ios/BasicControls/Package.swift'), 'utf8');
      const sampleDependsOnLibrary = manifest.includes('.target(name: "BasicControlsSamples", dependencies: ["TechSkillPlanetBasicControls"]');
      return status(componentFiles >= 25 && sampleDependsOnLibrary, `${componentFiles} component Swift files; sample target depends on library=${sampleDependsOnLibrary}`);
    },
  },
  {
    platform: 'React Web',
    library: 'web/react/src',
    sample: 'web/react/sample',
    result() {
      const componentFiles = files('web/react/src/components', f => /^Tsp.+\.js$/.test(f)).length;
      const pageFiles = files('web/react/sample/src/pages', f => f.endsWith('.js')).length;
      const hasRouter = exists('web/react/sample/src/navigation/AppRouter.js');
      return status(componentFiles >= 25 && pageFiles >= 3 && hasRouter, `${componentFiles} component JS files; ${pageFiles} sample page files; router=${hasRouter}`);
    },
  },
  {
    platform: 'Vue Web',
    library: 'web/vue/src',
    sample: 'web/vue/sample',
    result() {
      const componentFiles = files('web/vue/src/components', f => /^Tsp.+\.js$/.test(f)).length;
      const pageFiles = files('web/vue/sample/src/pages', f => f.endsWith('.js')).length;
      const hasRouter = exists('web/vue/sample/src/navigation/AppRouter.js');
      return status(componentFiles >= 25 && pageFiles >= 3 && hasRouter, `${componentFiles} component JS files; ${pageFiles} sample page files; router=${hasRouter}`);
    },
  },
  {
    platform: 'WeChat Mini Program',
    library: 'android/basiccontrols/miniprogram/basic-controls',
    sample: 'android/basiccontrols/miniprogram/pages/basic-samples',
    result() {
      const hasLibraryPackage = exists('android/basiccontrols/miniprogram/basic-controls/package.json');
      const hasSamplePage = exists('android/basiccontrols/miniprogram/pages/basic-samples/index.js');
      return status(hasLibraryPackage && hasSamplePage, `library package=${hasLibraryPackage}; basic-samples page=${hasSamplePage}`);
    },
  },
];

let failed = 0;
for (const check of checks) {
  const result = check.result();
  if (!result.ok) failed += 1;
  console.log(`${result.ok ? 'PASS' : 'FAIL'} ${check.platform}: ${result.note}`);
}

if (failed > 0) {
  process.exitCode = 1;
}
