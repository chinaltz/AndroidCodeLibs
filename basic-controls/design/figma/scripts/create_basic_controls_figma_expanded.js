// Basic Controls Sky Planet expanded Figma generator.
// Execute with Figma MCP use_figma in a Design file.
// This version keeps the output within the Figma Starter 3-page limit.

const createdNodeIds = [];
const mutatedNodeIds = [];

const C = {
  sky50: '#F9FDFF',
  sky150: '#E5F6FF',
  sky200: '#DDF4FF',
  sky300: '#C8EAFF',
  sky400: '#8BD5FF',
  sky500: '#31A8FF',
  sky600: '#1479D6',
  cloud: '#FFFFFF',
  cloudSoft: '#F6FBFF',
  cloudBorder: '#E4F5FF',
  ink300: '#7895AE',
  ink400: '#365D82',
  ink500: '#173A62',
  ink600: '#0F2A49',
  sun: '#FFD166',
  aurora: '#43CFC7',
  coral: '#FF6B7A',
  lift: '#8FCDEB'
};

const componentGroups = [
  {
    name: 'Actions',
    items: [
      ['BasicButton', 'default / primary / danger / text / link / disabled / pressed lift'],
      ['BasicToast', 'custom Android Toast view with semantic variants']
    ]
  },
  {
    name: 'Inputs',
    items: [
      ['BasicInputView', 'default / focus / error / disabled'],
      ['BasicSelectView', 'trigger plus PopupWindow menu / selected option / disabled']
    ]
  },
  {
    name: 'Selection',
    items: [
      ['BasicCheckboxView', 'checked / unchecked / disabled'],
      ['BasicRadioView', 'single selection in form groups'],
      ['BasicSwitchView', 'default / small / on / off / disabled / loading / inner text'],
      ['BasicChipView', 'selectable pill with primary / success / warning / danger']
    ]
  },
  {
    name: 'Feedback',
    items: [
      ['BasicAlertView', 'info / success / warning / error'],
      ['BasicLoadingView', 'inline animated stripe loading'],
      ['BasicPlanetLoadingView', 'Sky Planet canvas animation shared by refresh and dialogs'],
      ['BasicLoadingDialog', 'semi-transparent blocking loading dialog with planet animation'],
      ['BasicBadgeView', 'count and status badge'],
      ['BasicRefreshLayout', 'pull-to-refresh and load-more container with planet animation']
    ]
  },
  {
    name: 'Navigation',
    items: [
      ['BasicTabsView', 'scrollable pill tabs with selected state']
    ]
  },
  {
    name: 'Surfaces',
    items: [
      ['BasicCardView', 'plain / title / interactive / selected'],
      ['BasicModalDialog', 'Dialog or DialogFragment panel'],
      ['BasicCollapseView', 'accordion header and expanded body'],
      ['BasicDividerView', 'line divider / section separator'],
      ['BasicEmptyView', 'empty state with planet motif and primary action']
    ]
  },
  {
    name: 'Data Display',
    items: [
      ['BasicListItemView', 'leading, title, subtitle, trailing'],
      ['BasicTableView', 'header, rows, zebra surfaces, empty state'],
      ['BasicCodeBlockView', 'title bar and horizontal code scroller'],
      ['BasicTypewriterView', 'AI-style progressive text reveal']
    ]
  }
];

function rgb(hex) {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function fill(hex, opacity = 1) {
  return [{ type: 'SOLID', color: rgb(hex), opacity }];
}

function track(node) {
  createdNodeIds.push(node.id);
  return node;
}

async function loadFonts() {
  for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold']) {
    await figma.loadFontAsync({ family: 'Inter', style });
  }
}

function getPage(name, index) {
  let page = figma.root.children.find((item) => item.name === name);
  if (!page) {
    if (figma.root.children[index]) {
      page = figma.root.children[index];
    } else {
      page = figma.createPage();
    }
  }
  page.name = name;
  mutatedNodeIds.push(page.id);
  return page;
}

function frame(name, width, height, color = C.cloudSoft) {
  const node = track(figma.createFrame());
  node.name = name;
  node.resize(width, height);
  node.fills = fill(color);
  return node;
}

function auto(name, direction = 'VERTICAL', gap = 12, padding = 0, color = C.cloudSoft) {
  const node = frame(name, 100, 100, color);
  node.layoutMode = direction;
  node.primaryAxisSizingMode = 'AUTO';
  node.counterAxisSizingMode = 'AUTO';
  node.itemSpacing = gap;
  node.paddingTop = padding;
  node.paddingRight = padding;
  node.paddingBottom = padding;
  node.paddingLeft = padding;
  return node;
}

function text(name, value, size = 14, color = C.ink500, style = 'Medium', width) {
  const node = track(figma.createText());
  node.name = name;
  node.fontName = { family: 'Inter', style };
  node.fontSize = size;
  node.lineHeight = { unit: 'PERCENT', value: 150 };
  node.fills = fill(color);
  node.characters = value;
  if (width) {
    node.textAutoResize = 'HEIGHT';
    node.resize(width, node.height);
  }
  return node;
}

function rect(name, width, height, color, radius = 0, strokeColor, strokeWidth = 2) {
  const node = track(figma.createRectangle());
  node.name = name;
  node.resize(width, height);
  node.fills = fill(color);
  node.cornerRadius = radius;
  if (strokeColor) {
    node.strokes = fill(strokeColor);
    node.strokeWeight = strokeWidth;
  }
  return node;
}

function put(parent, child, fillWidth = false) {
  parent.appendChild(child);
  if (fillWidth) child.layoutSizingHorizontal = 'FILL';
  return child;
}

function board(title, subtitle, width = 1500, height = 1180) {
  const boardFrame = frame(`${title} Board`, width, height, C.sky200);
  boardFrame.x = 80;
  boardFrame.y = 80;
  const root = auto(`${title} Content`, 'VERTICAL', 24, 40, C.sky200);
  boardFrame.appendChild(root);
  put(root, text('Title', title, 36, C.ink600, 'Bold'));
  put(root, text('Subtitle', subtitle, 16, C.ink400, 'Regular', width - 120));
  return { boardFrame, root };
}

function catalogCard(title, description, width = 260, height = 132) {
  const card = auto(`Catalog / ${title}`, 'VERTICAL', 8, 16, C.cloud);
  card.resize(width, height);
  card.counterAxisSizingMode = 'FIXED';
  card.cornerRadius = 28;
  card.strokes = fill(C.sky300);
  card.strokeWeight = 2;
  put(card, text('Component Name', title, 15, C.ink600, 'Bold', width - 32));
  put(card, text('Component Note', description, 12, C.ink300, 'Regular', width - 32));
  const lift = rect(`Lift / ${title}`, width - 32, 6, C.lift, 999);
  lift.opacity = 0.72;
  put(card, lift);
  return card;
}

function groupSection(group) {
  const section = auto(`Group / ${group.name}`, 'VERTICAL', 12, 18, C.cloudSoft);
  section.cornerRadius = 32;
  section.strokes = fill(C.sky300);
  section.strokeWeight = 2;
  put(section, text('Group Title', group.name, 20, C.ink600, 'Bold'));
  const grid = auto(`Grid / ${group.name}`, 'HORIZONTAL', 12, 0, C.cloudSoft);
  for (const [name, desc] of group.items) {
    put(grid, catalogCard(name, desc, 230, 124));
  }
  put(section, grid);
  return section;
}

function tokenPage(root) {
  const palettes = auto('Palette Grid', 'HORIZONTAL', 18, 0, C.sky200);
  put(root, palettes);
  const groups = [
    ['Sky / Brand', [
      ['sky.brandSubtle', C.sky150],
      ['sky.borderSoft', C.sky300],
      ['sky.brandHover', C.sky400],
      ['sky.brandPrimary', C.sky500],
      ['sky.brandPressed', C.sky600]
    ]],
    ['Cloud / Surface', [
      ['cloud.white', C.cloud],
      ['cloud.soft', C.cloudSoft],
      ['cloud.border', C.cloudBorder],
      ['sky.pageEnd', C.sky50]
    ]],
    ['Ink / Text', [
      ['ink.textTertiary', C.ink300],
      ['ink.textSecondary', C.ink400],
      ['ink.textPrimary', C.ink500],
      ['ink.textStrong', C.ink600]
    ]],
    ['Status', [
      ['sun.highlight', C.sun],
      ['aurora.success', C.aurora],
      ['coral.danger', C.coral]
    ]]
  ];
  for (const [name, tokens] of groups) {
    const group = auto(`Palette / ${name}`, 'VERTICAL', 8, 14, C.cloud);
    group.cornerRadius = 18;
    group.strokes = fill(C.sky300);
    group.strokeWeight = 2;
    put(group, text('Name', name, 13, C.ink600, 'Bold'));
    for (const [tokenName, color] of tokens) {
      const row = auto(`Swatch / ${tokenName}`, 'HORIZONTAL', 8, 0, C.cloud);
      row.counterAxisAlignItems = 'CENTER';
      put(row, rect('Color', 34, 34, color, 10));
      put(row, text('Token', `${tokenName}  ${color}`, 11, C.ink400, 'Regular'));
      put(group, row);
    }
    put(palettes, group);
  }
  const samples = auto('Style Samples', 'HORIZONTAL', 18, 0, C.sky200);
  put(root, samples);
  put(samples, catalogCard('Radius', 'sm 8 / lg 18 / xl 24 / pill 999'));
  put(samples, catalogCard('Control Height', 'sm 32 / md 40 / buttonMedium 45 / lg 48'));
  put(samples, catalogCard('Typography', '12sp label / 14sp body / 18sp title / 28sp dialog'));
  put(samples, catalogCard('Component Sizing', 'badge, chip, toast, table, nav, drawer, banner, avatar'));
  put(samples, catalogCard('Switch Tokens', 'off/on track, handle, spinner, opacity, sm/md inner text'));
  put(samples, catalogCard('Animation Tokens', 'loading loop, switch motion, planet refresh/dialog motion'));
}

function catalogPage(root) {
  for (const group of componentGroups) {
    put(root, groupSection(group));
  }
}

function previewPage(root) {
  const phone = auto('Android 390x844 / Basic Controls', 'VERTICAL', 18, 24, C.sky200);
  phone.resize(390, 844);
  phone.counterAxisSizingMode = 'FIXED';
  phone.cornerRadius = 42;
  phone.strokes = fill(C.ink600);
  phone.strokeWeight = 4;
  put(phone, text('App Title', 'Basic Controls', 28, C.ink600, 'Bold'));
  put(phone, text('App Subtitle', 'Token driven Android View components', 13, C.ink300, 'Medium'));
  put(phone, catalogCard('Input + Select', 'BasicInputView, BasicSelectView', 320, 92), true);
  put(phone, catalogCard('Switch + Selection', 'BasicSwitchView, Checkbox, Radio, Chip', 320, 120), true);
  put(phone, catalogCard('Refresh + Loading', 'BasicRefreshLayout, PlanetLoadingView, LoadingDialog', 320, 120), true);
  put(phone, catalogCard('Table + Code', 'BasicTableView, BasicCodeBlockView, Typewriter', 320, 120), true);
  put(phone, catalogCard('Modal + Collapse', 'BasicModalDialog, BasicCollapseView, BasicDividerView', 320, 92), true);
  put(root, phone);
}

await loadFonts();

let page = getPage('00 Tokens', 0);
await figma.setCurrentPageAsync(page);
let result = board('Basic Controls Sky Planet Tokens', 'Two JSON theme model: color_token.json for primitive and semantic colors; style_token.json for spacing, radius, size, typography, shadow, motion, and component dimensions. Shape language references animal-island-ui, recolored with Sky Planet tokens.', 1500, 980);
page.appendChild(result.boardFrame);
tokenPage(result.root);

page = getPage('01 Expanded Components + Android View Mapping', 1);
await figma.setCurrentPageAsync(page);
result = board('Expanded Basic Controls Catalogue', 'Component breadth follows Digital Channel Product Line Component. Shape style references animal-island-ui pill controls, organic cards, and bottom lift shadows, while colors remain Sky Planet blue tokens.', 2100, 1800);
page.appendChild(result.boardFrame);
catalogPage(result.root);

page = getPage('02 Theme Preview', 2);
await figma.setCurrentPageAsync(page);
result = board('Android Theme Preview', 'A compact Android screen preview showing how the expanded component set fits a Java + XML product UI.', 1120, 940);
page.appendChild(result.boardFrame);
previewPage(result.root);

figma.viewport.scrollAndZoomIntoView([result.boardFrame]);

return {
  createdNodeIds,
  mutatedNodeIds,
  filePages: ['00 Tokens', '01 Expanded Components + Android View Mapping', '02 Theme Preview'],
  componentCount: componentGroups.reduce((sum, group) => sum + group.items.length, 0),
  message: 'Synced current implemented Basic Controls component catalogue for Java + classic Android View.'
};
