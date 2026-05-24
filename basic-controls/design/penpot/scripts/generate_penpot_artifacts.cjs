const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const TOKEN_DIR = path.join(ROOT, "design/tokens");
const OUT_DIR = path.join(ROOT, "design/penpot");
const PREVIEW_DIR = path.join(OUT_DIR, "preview");

const PENPOT_FILE_URL =
  "https://design.penpot.app/#/workspace?team-id=e7a86fff-661d-81c1-8008-103779d6d184&file-id=e7a86fff-661d-81c1-8008-10381337624c&page-id=e7a86fff-661d-81c1-8008-10381337624d";

const COMPONENTS = [
  ["BasicButton", "Button", "primary/default/danger/text/link/disabled/pressed"],
  ["BasicInputView", "Input", "focus/error/disabled"],
  ["BasicSwitchView", "Switch", "small/default, checked/loading/disabled"],
  ["BasicCheckboxView", "Checkbox", "checked/unchecked/disabled"],
  ["BasicRadioView", "Radio", "checked/unchecked/disabled"],
  ["BasicSelectView", "Select", "trigger/menu/selected option"],
  ["BasicTabsView", "Tabs", "selected/default"],
  ["BasicCardView", "Card", "cloud surface / organic radius"],
  ["BasicAlertView", "Alert", "info/success/warning/error"],
  ["BasicBadgeView", "Badge", "status/count"],
  ["BasicChipView", "Chip", "selected/removable"],
  ["BasicListItemView", "List Item", "title/subtitle/action"],
  ["BasicProgressView", "Progress", "linear status progress"],
  ["BasicLoadingView", "Loading", "inline loading"],
  ["BasicPlanetLoadingView", "Planet Loading", "sky planet animated loader"],
  ["BasicLoadingDialog", "Loading Dialog", "translucent modal loading"],
  ["BasicRefreshLayout", "Refresh Layout", "pull refresh / load more"],
  ["BasicToast", "Toast", "custom transient message"],
  ["BasicEmptyView", "Empty", "empty state"],
  ["BasicDividerView", "Divider", "solid/dashed section divider"],
  ["BasicCollapseView", "Collapse", "expanded/collapsed"],
  ["BasicModalDialog", "Modal", "dialog header/body/actions"],
  ["BasicTableView", "Table", "header/rows/cells"],
  ["BasicCodeBlockView", "Code Block", "mono surface"],
  ["BasicTypewriterView", "Typewriter", "text animation"]
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(TOKEN_DIR, file), "utf8"));
}

function ensureDirs() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
}

function flatten(obj, prefix = "", out = {}) {
  Object.keys(obj || {}).forEach((key) => {
    const value = obj[key];
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, next, out);
    } else {
      out[next] = value;
    }
  });
  return out;
}

function resolveRefs(value, lookup, guard = []) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\{(.+)\}$/);
  if (!match) return value;
  const ref = match[1];
  if (guard.includes(ref)) {
    throw new Error(`Circular token reference: ${guard.join(" -> ")} -> ${ref}`);
  }
  return resolveRefs(lookup[ref], lookup, guard.concat(ref));
}

function tokenRecord(name, type, value, description) {
  return {
    $type: type,
    $value: value,
    $description: description
  };
}

function buildPenpotTokenImport(colorTokens, styleTokens) {
  const theme = colorTokens.themes.sky_planet_day;
  const colorFlatRaw = {
    ...flatten(theme.primitive, "primitive"),
    ...flatten(theme.semantic, "semantic")
  };
  const colorFlat = {};
  Object.entries(colorFlatRaw).forEach(([name, value]) => {
    colorFlat[name] = resolveRefs(value, colorFlatRaw);
  });

  const styleFlatRaw = flatten({
    font: styleTokens.font,
    space: styleTokens.space,
    radius: styleTokens.radius,
    border: styleTokens.border,
    size: styleTokens.size,
    padding: styleTokens.padding,
    shadow: styleTokens.shadow,
    opacity: styleTokens.opacity,
    motion: styleTokens.motion
  });

  const tokens = {};
  Object.entries(colorFlat).forEach(([name, value]) => {
    tokens[name] = tokenRecord(name, "color", value, "Synced from color_token.json");
  });
  Object.entries(styleFlatRaw).forEach(([name, value]) => {
    let type = "dimension";
    if (name.startsWith("font.family")) type = "fontFamily";
    if (name.startsWith("font.weight")) type = "fontWeight";
    if (name.startsWith("font.lineHeight")) type = "number";
    if (name.startsWith("font.letterSpacing")) type = "dimension";
    if (name.startsWith("opacity")) type = "number";
    if (name.startsWith("motion")) type = "duration";
    if (typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) type = "string";
    tokens[name] = tokenRecord(name, type, value, "Synced from style_token.json");
  });

  return {
    $schema: "https://basic-controls.local/schemas/penpot-token-export.schema.json",
    meta: {
      name: "TechFun Planet Basic Controls Penpot Tokens",
      source: "Generated from design/tokens/color_token.json and style_token.json",
      penpotFile: PENPOT_FILE_URL,
      generatedAt: new Date().toISOString(),
      note: "Keep color/style token keys stable. Reskin by replacing values in the two source JSON files, then regenerate this file."
    },
    tokens
  };
}

function writeReadme() {
  const content = `# Penpot Design Sync

Penpot is now the primary editable design target for Basic Controls.

- Penpot file: ${PENPOT_FILE_URL}
- Source color tokens: \`../tokens/color_token.json\`
- Source style tokens: \`../tokens/style_token.json\`
- Generated token import: \`penpot-token-import.json\`
- Generated design brief: \`penpot-design-brief.md\`
- Local visual preview: \`preview/basic-controls-preview.html\`
- Codex MCP setup: \`CODEX_MCP_SETUP.md\`

## Workflow

1. Edit only \`design/tokens/color_token.json\` and \`design/tokens/style_token.json\` for skinning.
2. Run \`node design/penpot/scripts/generate_penpot_artifacts.cjs\`.
3. Use the configured Penpot Cloud MCP server from Codex.
4. Restart/refresh Codex after MCP config changes so the \`penpot\` tools are loaded.
5. Sync token values/pages from the generated files through Penpot MCP when available.
6. Keep Android components mapped to the same semantic token keys.

Local fallback: run \`bash design/penpot/scripts/start_penpot_mcp.sh\` and point Codex at \`http://localhost:4401/mcp\`.

Figma remains an optional export path. Penpot is the source design workspace going forward.
`;
  fs.writeFileSync(path.join(OUT_DIR, "README.md"), content);
}

function writeBrief(colorTokens, styleTokens) {
  const primitive = flatten(colorTokens.themes.sky_planet_day.primitive, "primitive");
  const semantic = flatten(colorTokens.themes.sky_planet_day.semantic, "semantic");
  const componentRows = COMPONENTS.map(([android, penpot, states]) => `| \`${android}\` | ${penpot} | ${states} |`).join("\n");
  const colorRows = Object.entries({ ...primitive, ...semantic })
    .map(([key, value]) => `| \`${key}\` | \`${value}\` |`)
    .join("\n");
  const styleHighlights = [
    ["radius.controlIsland", styleTokens.radius.controlIsland],
    ["radius.cardOrganic", styleTokens.radius.cardOrganic],
    ["radius.dialogOrganic", styleTokens.radius.dialogOrganic],
    ["size.switch.md.width", styleTokens.size.switch.md.width],
    ["size.switch.md.height", styleTokens.size.switch.md.height],
    ["motion.switch.duration", styleTokens.motion.switch.duration],
    ["border.width.switch", styleTokens.border.width.switch]
  ]
    .map(([key, value]) => `| \`${key}\` | \`${value}\` |`)
    .join("\n");

  const content = `# Penpot Design Brief

## Target

- File: ${PENPOT_FILE_URL}
- Product: TechFun Planet Basic Controls
- Platform: Android Java View + XML, no Compose
- Visual direction: animal-island-ui inspired organic controls, recolored into 技趣星球 sky planet theme

## Pages

1. \`00 Tokens\`: color, typography, radius, spacing, motion and component size boards.
2. \`01 Components\`: editable Penpot components and variants.
3. \`02 Android View Mapping\`: Java class, XML attrs, state strategy, token usage.
4. \`03 Theme Preview\`: light/day theme preview screen.
5. \`04 Samples Preview\`: visual parity with Android Samples app.

## Component Coverage

| Android class | Penpot component | Required states |
|---|---|---|
${componentRows}

## Token Sync Rules

- \`color_token.json\` owns color meaning and state semantics.
- \`style_token.json\` owns size, radius, spacing, typography, opacity and motion.
- Penpot token names should keep the dot path names, such as \`semantic.control.switch.onBackground\`.
- Android runtime should keep using \`BasicThemeManager\`, \`BasicColors\`, \`BasicStyle\` and \`BasicTokenResolver\`.

## Color Tokens

| Token | Value / Reference |
|---|---|
${colorRows}

## Style Highlights

| Token | Value |
|---|---|
${styleHighlights}

## Penpot Build Notes

- Use component variants for visible states rather than duplicating unrelated frames.
- Use token names as layer labels where Penpot token binding is not available.
- Keep loading, refresh and switch animations documented with motion tokens even when the Penpot static frame cannot animate them directly.
- Preserve the Android class name in each component description to simplify later code/design sync.
`;
  fs.writeFileSync(path.join(OUT_DIR, "penpot-design-brief.md"), content);
}

function writePreview(colorTokens, styleTokens) {
  const theme = colorTokens.themes.sky_planet_day;
  const colorsRaw = {
    ...flatten(theme.primitive, "primitive"),
    ...flatten(theme.semantic, "semantic")
  };
  const c = (key) => resolveRefs(colorsRaw[key], colorsRaw);
  const s = styleTokens;
  const componentCards = COMPONENTS.map(([android, penpot, states]) => `
    <section class="component-card">
      <div class="component-title">${penpot}</div>
      <div class="component-meta">${android}</div>
      <div class="component-state">${states}</div>
    </section>`).join("");
  const content = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TechFun Planet Basic Controls Penpot Preview</title>
  <style>
    :root {
      --page: ${c("semantic.background.page")};
      --page-end: ${c("semantic.background.pageGradientEnd")};
      --surface: ${c("semantic.background.surface")};
      --surface-raised: ${c("semantic.background.surfaceRaised")};
      --brand: ${c("semantic.brand.primary")};
      --brand-hover: ${c("semantic.brand.primaryHover")};
      --brand-subtle: ${c("semantic.brand.primarySubtle")};
      --text: ${c("semantic.text.primary")};
      --text-secondary: ${c("semantic.text.secondary")};
      --border: ${c("semantic.border.default")};
      --success: ${c("semantic.status.success")};
      --warning: ${c("semantic.status.warning")};
      --danger: ${c("semantic.status.danger")};
      --radius-card: ${s.radius.cardOrganic}px;
      --radius-control: ${s.radius.controlIsland}px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: ${s.font.family.androidView}, system-ui, sans-serif;
      color: var(--text);
      background: linear-gradient(180deg, var(--page), var(--page-end));
    }
    main {
      width: min(1180px, calc(100vw - 48px));
      margin: 0 auto;
      padding: 40px 0 64px;
    }
    .hero {
      display: grid;
      grid-template-columns: 1.1fr .9fr;
      gap: 24px;
      align-items: stretch;
      margin-bottom: 24px;
    }
    .panel, .component-card {
      background: var(--surface-raised);
      border: 2px solid var(--border);
      border-radius: var(--radius-card);
      box-shadow: 0 12px 0 rgba(200, 234, 255, .75);
    }
    .panel { padding: 28px; }
    h1 {
      margin: 0 0 10px;
      font-size: ${s.font.size.display}px;
      line-height: 1.15;
      letter-spacing: 0;
    }
    p { margin: 0; color: var(--text-secondary); line-height: 1.7; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
    .button {
      min-height: ${s.size.controlHeight.buttonMedium}px;
      padding: 0 ${s.padding.button.mdHorizontal}px;
      border-radius: var(--radius-control);
      border: 2px solid var(--brand);
      display: inline-flex;
      align-items: center;
      font-weight: 700;
    }
    .button.primary { color: white; background: var(--brand); }
    .button.default { color: var(--text); background: white; }
    .button.danger { color: white; border-color: var(--danger); background: var(--danger); }
    .control-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 18px; align-items: center; }
    .input {
      min-width: 230px;
      height: ${s.size.controlHeight.lg}px;
      padding: 0 ${s.padding.input.mdHorizontal}px;
      border: 2px solid var(--border);
      border-radius: var(--radius-control);
      background: white;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
    }
    .switch {
      width: ${s.size.switch.md.width}px;
      height: ${s.size.switch.md.height}px;
      border-radius: ${s.radius.pill}px;
      border: ${s.border.width.switch}px solid var(--brand);
      background: var(--brand-hover);
      position: relative;
    }
    .switch::after {
      content: "";
      width: ${s.size.switch.md.handle}px;
      height: ${s.size.switch.md.handle}px;
      border-radius: 999px;
      background: white;
      border: 2px solid var(--brand);
      position: absolute;
      top: 1px;
      right: 2px;
    }
    .badge {
      height: ${s.size.badge.height}px;
      min-width: ${s.size.badge.minWidth}px;
      padding: 0 8px;
      border-radius: 999px;
      background: var(--success);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: ${s.font.size.xs}px;
      font-weight: 700;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    .component-card {
      min-height: 132px;
      padding: 18px;
      box-shadow: 0 8px 0 rgba(200, 234, 255, .55);
    }
    .component-title { font-size: ${s.font.size.lg}px; font-weight: 800; }
    .component-meta { margin-top: 6px; color: var(--brand); font-size: ${s.font.size.sm}px; font-weight: 700; }
    .component-state { margin-top: 14px; color: var(--text-secondary); font-size: ${s.font.size.sm}px; line-height: 1.5; }
    .loader {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 8px solid var(--brand-subtle);
      border-top-color: var(--brand);
      border-right-color: var(--success);
      animation: spin 1s linear infinite;
      margin: 20px auto 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 760px) {
      main { width: min(100vw - 28px, 420px); padding-top: 24px; }
      .hero { grid-template-columns: 1fr; }
      h1 { font-size: 28px; }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="panel">
        <h1>TechFun Planet Basic Controls</h1>
        <p>Penpot preview generated from the same two JSON token files used by the Android Java View library.</p>
        <div class="actions">
          <div class="button primary">Primary</div>
          <div class="button default">Default</div>
          <div class="button danger">Danger</div>
        </div>
        <div class="control-row">
          <div class="input">Sky planet input</div>
          <div class="switch"></div>
          <div class="badge">NEW</div>
        </div>
      </div>
      <div class="panel">
        <h1>Loading</h1>
        <p>Refresh, load-more and modal loading states share motion and color tokens.</p>
        <div class="loader"></div>
      </div>
    </section>
    <section class="preview-grid">
      ${componentCards}
    </section>
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(PREVIEW_DIR, "basic-controls-preview.html"), content);
}

function writeSyncLog() {
  const content = `# Penpot Sync Log

## Current Target

- Date: ${new Date().toISOString().slice(0, 10)}
- Penpot file: ${PENPOT_FILE_URL}
- Mode: Penpot Cloud
- Status: local Penpot artifacts generated; Penpot Cloud remote MCP is configured in Codex and should become available after Codex tool reload.

## Generated Files

- \`README.md\`
- \`CODEX_MCP_SETUP.md\`
- \`penpot-design-brief.md\`
- \`penpot-token-import.json\`
- \`preview/basic-controls-preview.html\`

## Next Penpot Steps

1. Open the Penpot file.
2. Restart/refresh Codex so the configured \`penpot\` tools are loaded.
3. Create pages named \`00 Tokens\`, \`01 Components\`, \`02 Android View Mapping\`, \`03 Theme Preview\`, \`04 Samples Preview\`.
4. Use \`penpot-token-import.json\` as the token source/reference.
5. Use \`penpot-design-brief.md\` for component coverage and state mapping.
6. Use the HTML preview as visual parity guidance for the first editable component pass.
`;
  fs.writeFileSync(path.join(OUT_DIR, "PENPOT_SYNC.md"), content);
}

function main() {
  ensureDirs();
  const colorTokens = readJson("color_token.json");
  const styleTokens = readJson("style_token.json");
  const penpotTokens = buildPenpotTokenImport(colorTokens, styleTokens);
  fs.writeFileSync(
    path.join(OUT_DIR, "penpot-token-import.json"),
    JSON.stringify(penpotTokens, null, 2)
  );
  writeReadme();
  writeBrief(colorTokens, styleTokens);
  writePreview(colorTokens, styleTokens);
  writeSyncLog();
  console.log(`Generated Penpot artifacts in ${OUT_DIR}`);
}

main();
