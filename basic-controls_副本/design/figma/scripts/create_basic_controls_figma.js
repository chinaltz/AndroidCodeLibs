// Basic Controls Sky Planet Figma generator
// Execute this file content with Figma MCP use_figma in a Design file.
// It creates token boards, core components, and an Android preview screen.

const createdNodeIds = [];
const mutatedNodeIds = [];

const C = {
  teal50: '#E5F6FF',
  teal400: '#8BD5FF',
  teal500: '#31A8FF',
  teal600: '#1479D6',
  teal700: '#0F65B5',
  sand50: '#FEFFFF',
  sand100: '#FFFFFF',
  sand150: '#F6FBFF',
  sand200: '#DDF4FF',
  sand250: '#E4F5FF',
  sand300: '#C8EAFF',
  sand400: '#B6E0FA',
  sand500: '#9ED4F5',
  sand600: '#C8EAFF',
  sand700: '#8FCDEB',
  wood300: '#7895AE',
  wood400: '#365D82',
  wood500: '#234B70',
  wood600: '#173A62',
  wood700: '#0F2A49',
  wood800: '#08213C',
  sun300: '#FFE79A',
  sun400: '#FFD166',
  sun500: '#FFC94D',
  sun600: '#D89A20',
  sunSoft: '#FFF7D7',
  leaf400: '#70E5DE',
  leaf500: '#43CFC7',
  leaf600: '#16A9A1',
  leafSoft: '#DDF8F6',
  coral400: '#FF8A95',
  coral500: '#FF6B7A',
  coral600: '#E24C5C',
  white: '#FFFFFF',
  black: '#000000',
  overlay: '#173A6259'
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const hasAlpha = clean.length === 8;
  const int = parseInt(clean.slice(0, 6), 16);
  return {
    r: ((int >> 16) & 255) / 255,
    g: ((int >> 8) & 255) / 255,
    b: (int & 255) / 255,
    a: hasAlpha ? parseInt(clean.slice(6), 16) / 255 : 1
  };
}

function solid(hex, opacity) {
  const rgba = hexToRgb(hex);
  return [{ type: 'SOLID', color: { r: rgba.r, g: rgba.g, b: rgba.b }, opacity: opacity ?? rgba.a }];
}

function stroke(hex, width = 2, opacity) {
  return { strokes: solid(hex, opacity), strokeWeight: width };
}

function effectShadow(x, y, blur, spread, hex, opacity) {
  const rgba = hexToRgb(hex);
  return [{
    type: 'DROP_SHADOW',
    visible: true,
    blendMode: 'NORMAL',
    color: { r: rgba.r, g: rgba.g, b: rgba.b, a: opacity ?? rgba.a },
    offset: { x, y },
    radius: blur,
    spread
  }];
}

async function loadFonts() {
  const fonts = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium' },
    { family: 'Inter', style: 'Semi Bold' },
    { family: 'Inter', style: 'Bold' }
  ];
  for (const font of fonts) {
    await figma.loadFontAsync(font);
  }
}

function track(node) {
  createdNodeIds.push(node.id);
  return node;
}

function frame(name, x, y, w, h, fillHex) {
  const node = track(figma.createFrame());
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(w, h);
  node.fills = fillHex ? solid(fillHex) : [];
  return node;
}

function auto(name, direction = 'VERTICAL', opts = {}) {
  const node = track(figma.createFrame());
  node.name = name;
  node.layoutMode = direction;
  node.primaryAxisSizingMode = opts.primaryAxisSizingMode || 'AUTO';
  node.counterAxisSizingMode = opts.counterAxisSizingMode || 'AUTO';
  node.itemSpacing = opts.gap ?? 12;
  node.paddingTop = opts.pt ?? opts.p ?? 0;
  node.paddingRight = opts.pr ?? opts.p ?? 0;
  node.paddingBottom = opts.pb ?? opts.p ?? 0;
  node.paddingLeft = opts.pl ?? opts.p ?? 0;
  node.fills = opts.fill ? solid(opts.fill, opts.opacity) : [];
  if (opts.radius !== undefined) node.cornerRadius = opts.radius;
  if (opts.stroke) Object.assign(node, stroke(opts.stroke, opts.strokeWidth ?? 2));
  if (opts.effects) node.effects = opts.effects;
  if (opts.align) node.counterAxisAlignItems = opts.align;
  if (opts.primaryAlign) node.primaryAxisAlignItems = opts.primaryAlign;
  return node;
}

function rect(name, w, h, fillHex, radius = 0, strokeHex, strokeWidth = 2) {
  const node = track(figma.createRectangle());
  node.name = name;
  node.resize(w, h);
  node.fills = solid(fillHex);
  node.cornerRadius = radius;
  if (strokeHex) Object.assign(node, stroke(strokeHex, strokeWidth));
  return node;
}

function ellipse(name, size, fillHex, strokeHex, strokeWidth = 2) {
  const node = track(figma.createEllipse());
  node.name = name;
  node.resize(size, size);
  node.fills = solid(fillHex);
  if (strokeHex) Object.assign(node, stroke(strokeHex, strokeWidth));
  return node;
}

function text(name, value, size = 14, color = C.wood600, weight = 'Medium', width) {
  const node = track(figma.createText());
  node.name = name;
  node.fontName = { family: 'Inter', style: weight };
  node.fontSize = size;
  node.lineHeight = { unit: 'PERCENT', value: 157.15 };
  node.fills = solid(color);
  node.characters = value;
  if (width) {
    node.textAutoResize = 'HEIGHT';
    node.resize(width, node.height);
  }
  return node;
}

function append(parent, child, fillWidth = false) {
  parent.appendChild(child);
  if (fillWidth) child.layoutSizingHorizontal = 'FILL';
  return child;
}

function addLabel(parent, title, desc) {
  append(parent, text('Label / ' + title, title, 18, C.wood700, 'Bold'));
  if (desc) append(parent, text('Description / ' + title, desc, 12, C.wood300, 'Regular', 260));
}

function makeButton(label, variant = 'default', size = 'md') {
  const height = size === 'sm' ? 32 : size === 'lg' ? 48 : 45;
  const hPad = size === 'sm' ? 16 : size === 'lg' ? 32 : 20;
  const btn = auto('Button / ' + variant + ' / ' + size, 'HORIZONTAL', {
    p: 0,
    pl: hPad,
    pr: hPad,
    gap: 8,
    fill: variant === 'text' || variant === 'link' || variant === 'ghost' ? undefined : C.sand100,
    radius: 50,
    stroke: variant === 'dashed' ? C.wood300 : variant === 'primary' ? C.sand100 : variant === 'danger' ? C.coral500 : C.sand500,
    strokeWidth: 2,
    align: 'CENTER',
    primaryAlign: 'CENTER',
    effects: variant === 'primary' ? effectShadow(0, 4, 0, 0, C.sand600, 1) : effectShadow(0, 8, 20, 0, C.teal500, 0.08)
  });
  btn.resize(Math.max(88, label.length * 10 + hPad * 2), height);
  btn.counterAxisSizingMode = 'FIXED';
  if (variant === 'dashed') btn.dashPattern = [6, 4];
  if (variant === 'text' || variant === 'link' || variant === 'ghost') {
    btn.fills = [];
    btn.strokes = [];
    btn.effects = [];
  }
  if (variant === 'danger') btn.fills = solid(C.coral500);
  if (variant === 'primary') btn.fills = solid(C.teal500);
  const labelColor = variant === 'danger' || variant === 'primary' ? C.white : variant === 'link' || variant === 'ghost' ? C.teal500 : C.wood600;
  append(btn, text('Text', label, size === 'sm' ? 12 : size === 'lg' ? 16 : 14, labelColor, 'Semi Bold'));
  return btn;
}

function makeInput(label, state = 'default') {
  const box = auto('Input / ' + state, 'HORIZONTAL', {
    pl: 16, pr: 16, pt: 0, pb: 0, gap: 8,
    fill: state === 'disabled' ? C.sand250 : C.white,
    radius: 16,
    stroke: state === 'error' ? C.coral500 : state === 'warning' ? C.sun400 : state === 'focus' ? C.teal500 : C.sand300,
    strokeWidth: 2,
    align: 'CENTER'
  });
  box.resize(240, 45);
  box.counterAxisSizingMode = 'FIXED';
  append(box, text('Placeholder', label, 14, state === 'disabled' ? C.sand500 : C.wood700, 'Medium'));
  return box;
}

function makeCheckbox(label, checked = false, size = 22) {
  const row = auto('Checkbox / ' + (checked ? 'checked' : 'unchecked'), 'HORIZONTAL', { gap: 8, align: 'CENTER' });
  const box = rect('Control', size, size, checked ? C.teal500 : C.sand150, size === 18 ? 4 : 6, checked ? C.teal600 : C.sand500, 2);
  append(row, box);
  if (checked) {
    const mark = text('Check', '✓', 14, C.white, 'Bold');
    box.appendChild(mark);
    mark.x = 4;
    mark.y = 0;
  }
  append(row, text('Label', label, 14, C.wood700, 'Medium'));
  return row;
}

function makeSwitch(checked = false, size = 'md') {
  const w = size === 'sm' ? 38 : 52;
  const h = size === 'sm' ? 20 : 28;
  const handle = size === 'sm' ? 14 : 21;
  const node = frame('Switch / ' + (checked ? 'on' : 'off'), 0, 0, w, h, checked ? C.leafSoft : C.sand400);
  node.cornerRadius = 50;
  Object.assign(node, stroke(checked ? C.leaf500 : C.sand500, 2.5));
  const dot = ellipse('Handle', handle, C.sand150, checked ? C.leaf500 : C.sand500, 2.5);
  node.appendChild(dot);
  dot.x = checked ? w - handle - 3 : 3;
  dot.y = (h - handle) / 2;
  return node;
}

function makeSelect() {
  const wrap = auto('Select / open', 'VERTICAL', { gap: 6 });
  append(wrap, makeInput('星球主题', 'focus'));
  const menu = auto('Select Dropdown', 'VERTICAL', { pt: 12, pb: 12, pl: 0, pr: 0, fill: C.sand100, radius: 28, gap: 0, stroke: C.sand300 });
  menu.resize(180, 160);
  menu.counterAxisSizingMode = 'FIXED';
  ['星球日间', '云海夜间', '晴空节日'].forEach((item, idx) => {
    const option = auto('Option / ' + item, 'HORIZONTAL', { pl: 18, pr: 18, pt: 10, pb: 10, gap: 8, align: 'CENTER' });
    if (idx === 0) {
      option.fills = solid(C.teal50, 1);
      option.cornerRadius = 14;
    }
    append(option, text('Option Text', item, 14, C.wood700, idx === 0 ? 'Bold' : 'Medium'));
    append(menu, option, true);
  });
  append(wrap, menu);
  return wrap;
}

function makeCard(title, desc, fill = C.sand100) {
  const card = auto('Card / ' + title, 'VERTICAL', {
    p: 24, gap: 10, fill, radius: 18, stroke: C.sand500, strokeWidth: 2,
    effects: effectShadow(0, 12, 28, 0, C.teal500, 0.08)
  });
  card.resize(260, 150);
  card.counterAxisSizingMode = 'FIXED';
  append(card, text('Card Title', title, 18, C.wood700, 'Bold'));
  append(card, text('Card Body', desc, 13, C.wood300, 'Regular', 210));
  return card;
}

function makeModal() {
  const modal = auto('Modal / organic dialog', 'VERTICAL', {
    pt: 48, pr: 48, pb: 32, pl: 48, gap: 18, fill: C.sand150, radius: 36,
    effects: effectShadow(0, 18, 42, 0, C.teal500, 0.12)
  });
  modal.resize(560, 360);
  modal.counterAxisSizingMode = 'FIXED';
  const header = auto('Header', 'HORIZONTAL', { gap: 16, align: 'CENTER' });
  append(header, text('Title', '星球通知', 28, C.wood700, 'Bold'));
  const spacer = rect('Spacer', 220, 1, C.sand150, 0);
  spacer.opacity = 0;
  append(header, spacer);
  append(header, ellipse('Close', 32, C.sand200));
  append(modal, header, true);
  append(modal, text('Body', 'Tokens are ready for Figma and classic Android View. Color and style JSON files drive the full component skin.', 20, C.wood400, 'Semi Bold', 460));
  const footer = auto('Footer', 'HORIZONTAL', { gap: 12, align: 'CENTER', primaryAlign: 'MAX' });
  append(footer, makeButton('取消', 'default', 'md'));
  append(footer, makeButton('确认', 'primary', 'md'));
  append(modal, footer, true);
  return modal;
}

function makeCollapse() {
  const card = auto('Collapse / expanded', 'VERTICAL', { fill: C.sand100, radius: 18, stroke: C.sand500, strokeWidth: 2, gap: 0 });
  card.resize(320, 150);
  card.counterAxisSizingMode = 'FIXED';
  const header = auto('Question Header', 'HORIZONTAL', { pl: 24, pr: 24, pt: 16, pb: 16, gap: 12, align: 'CENTER' });
  append(header, ellipse('Question Icon', 28, C.teal500));
  append(header, text('Question', 'How to reskin?', 16, C.wood600, 'Semi Bold'));
  append(card, header, true);
  const body = text('Answer', 'Parse JSON, update BasicControlsTheme, and keep components on semantic tokens only.', 14, C.wood300, 'Regular', 260);
  body.x = 24;
  append(card, body);
  return card;
}

function makeTabs() {
  const tabs = auto('Tabs / pill', 'HORIZONTAL', { p: 4, gap: 4, fill: C.sand250, radius: 50, stroke: C.sand300 });
  ['组件', '样式', '映射'].forEach((item, idx) => {
    const tab = auto('Tab / ' + item + (idx === 0 ? ' / active' : ''), 'HORIZONTAL', {
      pl: 16, pr: 16, pt: 8, pb: 8, gap: 6, align: 'CENTER',
      fill: idx === 0 ? C.teal500 : undefined,
      radius: 50
    });
    append(tab, text('Tab Text', item, 13, idx === 0 ? C.white : C.wood400, 'Semi Bold'));
    append(tabs, tab);
  });
  return tabs;
}

function makeDivider(kind = 'line') {
  const wrap = auto('Divider / ' + kind, 'VERTICAL', { gap: 8 });
  append(wrap, text('Divider Label', kind === 'dashed' ? 'Dashed divider' : 'Line divider', 12, C.wood300, 'Medium'));
  const line = rect('Divider Line', 280, 2, C.sand500, 2);
  if (kind === 'dashed') line.dashPattern = [8, 6];
  append(wrap, line);
  return wrap;
}

function makeLoading() {
  const wrap = auto('Loading / stripe', 'HORIZONTAL', { gap: 12, align: 'CENTER' });
  const spinner = frame('Spinner', 0, 0, 32, 32, C.teal50);
  spinner.cornerRadius = 50;
  Object.assign(spinner, stroke(C.teal500, 4));
  const cut = rect('Spinner Cut', 18, 18, C.teal50, 0);
  spinner.appendChild(cut);
  cut.x = 16;
  cut.y = -2;
  const bar = auto('Loading Bar', 'HORIZONTAL', { p: 4, gap: 4, fill: C.sand250, radius: 50, stroke: C.sand300 });
  bar.resize(180, 20);
  bar.counterAxisSizingMode = 'FIXED';
  append(bar, rect('Stripe A', 56, 12, C.teal400, 50));
  append(bar, rect('Stripe B', 56, 12, C.leaf500, 50));
  append(wrap, spinner);
  append(wrap, bar);
  return wrap;
}

function createColorPage() {
  let page = figma.root.children.find(p => p.name === '00 Tokens');
  if (!page) page = figma.createPage();
  page.name = '00 Tokens';
  return page;
}

function addTokenBoards(page) {
  const board = frame('Basic Controls Tokens / Sky Planet', 80, 80, 1320, 920, C.sand200);
  page.appendChild(board);
  const root = auto('Token Board Content', 'VERTICAL', { p: 40, gap: 28 });
  board.appendChild(root);
  append(root, text('Title', 'Basic Controls Sky Planet Design Tokens', 36, C.wood700, 'Bold'));
  append(root, text('Subtitle', 'Two JSON files drive skinning: color_token.json for color and style_token.json for radius, size, border, typography, spacing, shadow, and motion.', 16, C.wood400, 'Regular', 900));

  const colorsWrap = auto('Color Tokens', 'VERTICAL', { gap: 16 });
  append(colorsWrap, text('Section Title', 'Color Tokens', 24, C.wood700, 'Bold'));
  const colorGrid = auto('Color Grid', 'HORIZONTAL', { gap: 18 });
  const groups = [
    ['Sky / Brand', [C.teal50, C.teal400, C.teal500, C.teal600, C.teal700]],
    ['Cloud / Surface', [C.sand50, C.sand100, C.sand150, C.sand200, C.sand300, C.sand500]],
    ['Ink / Text', [C.wood300, C.wood400, C.wood600, C.wood700, C.wood800]],
    ['Sun / Highlight', [C.sunSoft, C.sun300, C.sun400, C.sun500, C.sun600]],
    ['Aurora / Success', [C.leafSoft, C.leaf400, C.leaf500, C.leaf600]],
    ['Coral / Danger', [C.coral400, C.coral500, C.coral600]]
  ];
  for (const [name, colors] of groups) {
    const group = auto('Palette / ' + name, 'VERTICAL', { gap: 8, fill: C.sand50, radius: 18, p: 14, stroke: C.sand300 });
    append(group, text('Palette Name', name, 13, C.wood700, 'Bold'));
    for (const color of colors) {
      const swatch = auto('Swatch / ' + color, 'HORIZONTAL', { gap: 8, align: 'CENTER' });
      append(swatch, rect('Color', 34, 34, color, 10));
      append(swatch, text('Hex', color, 11, C.wood400, 'Regular'));
      append(group, swatch);
    }
    append(colorGrid, group);
  }
  append(colorsWrap, colorGrid);
  append(root, colorsWrap);

  const stylesWrap = auto('Style Tokens', 'VERTICAL', { gap: 16 });
  append(stylesWrap, text('Section Title', 'Style Tokens', 24, C.wood700, 'Bold'));
  const styleRow = auto('Style Row', 'HORIZONTAL', { gap: 18 });
  const radiusCard = auto('Radius Tokens', 'VERTICAL', { p: 16, gap: 10, fill: C.sand50, radius: 18, stroke: C.sand300 });
  append(radiusCard, text('Card Title', 'Radius', 16, C.wood700, 'Bold'));
  [['sm', 8], ['lg', 16], ['xl', 18], ['xxl', 24], ['menu', 28], ['pill', 50]].forEach(([name, r]) => {
    const sample = rect('radius/' + name, 100, 34, C.teal50, r, C.teal500, 2);
    append(radiusCard, sample);
  });
  append(styleRow, radiusCard);

  const sizeCard = auto('Size Tokens', 'VERTICAL', { p: 16, gap: 10, fill: C.sand50, radius: 18, stroke: C.sand300 });
  append(sizeCard, text('Card Title', 'Control Heights', 16, C.wood700, 'Bold'));
  [['sm 32', 32], ['md 40', 40], ['buttonMedium 45', 45], ['lg 48', 48]].forEach(([name, h]) => {
    const sample = rect('height/' + name, 150, h, C.sunSoft, 50, C.sun500, 2);
    append(sizeCard, sample);
  });
  append(styleRow, sizeCard);

  const typeCard = auto('Typography Tokens', 'VERTICAL', { p: 16, gap: 10, fill: C.sand50, radius: 18, stroke: C.sand300 });
  append(typeCard, text('Card Title', 'Typography', 16, C.wood700, 'Bold'));
  append(typeCard, text('Type sm', 'Label / 12sp Semibold', 12, C.wood600, 'Semi Bold'));
  append(typeCard, text('Type md', 'Body / 14sp Medium', 14, C.wood600, 'Medium'));
  append(typeCard, text('Type lg', 'Title / 16sp Semibold', 16, C.wood700, 'Semi Bold'));
  append(typeCard, text('Type dialog', 'Dialog Title / 28sp Bold', 28, C.wood700, 'Bold'));
  append(styleRow, typeCard);
  append(stylesWrap, styleRow);
  append(root, stylesWrap);
}

function createComponentsPage() {
  let page = figma.root.children.find(p => p.name === '01 Components');
  if (!page) page = figma.createPage();
  page.name = '01 Components';
  return page;
}

function addComponents(page) {
  const board = frame('Basic Controls Components', 80, 80, 1500, 1100, C.sand200);
  page.appendChild(board);
  const root = auto('Components Content', 'VERTICAL', { p: 40, gap: 28 });
  board.appendChild(root);
  append(root, text('Title', 'Basic Controls Components', 36, C.wood700, 'Bold'));
  append(root, text('Subtitle', 'Android native View component set for Java + XML. Every color and dimension is mapped to color_token.json or style_token.json.', 16, C.wood400, 'Regular', 980));

  const row1 = auto('Row / Controls', 'HORIZONTAL', { gap: 28 });
  const buttons = auto('Button Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(buttons, 'Button', 'default / primary / dashed / text / link / danger / ghost');
  append(buttons, makeButton('默认按钮', 'default', 'md'));
  append(buttons, makeButton('主要按钮', 'primary', 'md'));
  append(buttons, makeButton('虚线按钮', 'dashed', 'md'));
  append(buttons, makeButton('危险操作', 'danger', 'md'));
  append(buttons, makeButton('文字按钮', 'text', 'md'));
  append(row1, buttons);

  const inputs = auto('Input Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(inputs, 'Input', 'default / focus / warning / error / disabled');
  append(inputs, makeInput('请输入星球名称'));
  append(inputs, makeInput('正在输入...', 'focus'));
  append(inputs, makeInput('内容需要检查', 'warning'));
  append(inputs, makeInput('输入有误', 'error'));
  append(inputs, makeInput('不可编辑', 'disabled'));
  append(row1, inputs);

  const toggles = auto('Toggle Spec', 'VERTICAL', { p: 22, gap: 16, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(toggles, 'Checkbox & Switch', 'token-backed control states');
  append(toggles, makeCheckbox('接收星球通知', false));
  append(toggles, makeCheckbox('启用换肤', true));
  const switchRow = auto('Switch Row', 'HORIZONTAL', { gap: 18, align: 'CENTER' });
  append(switchRow, makeSwitch(false));
  append(switchRow, makeSwitch(true));
  append(toggles, switchRow);
  append(row1, toggles);
  append(root, row1);

  const row2 = auto('Row / Surfaces', 'HORIZONTAL', { gap: 28 });
  const selectCard = auto('Select Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(selectCard, 'Select', 'white cloud menu, sky highlight, rounded trigger');
  append(selectCard, makeSelect());
  append(row2, selectCard);

  const cards = auto('Card Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(cards, 'Card', 'plain / title / interactive / selected');
  append(cards, makeCard('Button', 'Pill button, light blue border, cloud-lift shadow.'));
  append(cards, makeCard('Modal', 'White cloud dialog with soft sky shadow.', C.teal50));
  append(row2, cards);

  const collapseCard = auto('Collapse Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(collapseCard, 'Collapse', 'FAQ-style card with animated icon');
  append(collapseCard, makeCollapse());
  append(row2, collapseCard);
  append(root, row2);

  const row3 = auto('Row / Navigation And Feedback', 'HORIZONTAL', { gap: 28 });
  const tabsCard = auto('Tabs Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(tabsCard, 'Tabs', 'pill / underline / active / disabled');
  append(tabsCard, makeTabs());
  append(row3, tabsCard);

  const dividerCard = auto('Divider Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(dividerCard, 'Divider', 'line / dashed / cloud wave');
  append(dividerCard, makeDivider('line'));
  append(dividerCard, makeDivider('dashed'));
  append(row3, dividerCard);

  const loadingCard = auto('Loading Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(loadingCard, 'Loading', 'spinner / stripe / inline feedback');
  append(loadingCard, makeLoading());
  append(row3, loadingCard);
  append(root, row3);

  const modalWrap = auto('Modal Spec', 'VERTICAL', { p: 22, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  addLabel(modalWrap, 'Modal', 'white cloud dialog, soft sky shadow, blue-black scrim');
  append(modalWrap, makeModal());
  append(root, modalWrap);
}

function createMappingPage() {
  let page = figma.root.children.find(p => p.name === '02 Android View Mapping');
  if (!page) page = figma.createPage();
  page.name = '02 Android View Mapping';
  return page;
}

function addMapping(page) {
  const board = frame('Android View Mapping Board', 80, 80, 1200, 760, C.sand200);
  page.appendChild(board);
  const root = auto('Mapping Content', 'VERTICAL', { p: 40, gap: 24 });
  board.appendChild(root);
  append(root, text('Title', 'Android View Mapping', 36, C.wood700, 'Bold'));
  append(root, text('Subtitle', 'First implementation target: Java classes, XML layouts, custom View/ViewGroup, Drawable and StateListDrawable. Compose is intentionally out of scope.', 16, C.wood400, 'Regular', 900));

  const grid = auto('Mapping Grid', 'HORIZONTAL', { gap: 20 });
  const items = [
    ['BasicButton', 'AppCompatTextView or FrameLayout', 'StateListDrawable for enabled / pressed / disabled.'],
    ['BasicInputView', 'LinearLayout or FrameLayout', 'EditText plus optional prefix, suffix, clear button.'],
    ['BasicSelectView', 'FrameLayout + PopupWindow', 'Input-style trigger and cloud dropdown menu.'],
    ['BasicCheckboxView', 'CheckBox or custom View', 'Token-backed button drawable and checked state.'],
    ['BasicSwitchView', 'SwitchCompat or custom View', 'Sky track, white handle, optional animation.'],
    ['BasicCardView', 'FrameLayout', 'GradientDrawable background, border, radius, subtle elevation.'],
    ['BasicModalDialog', 'Dialog or DialogFragment', 'Cloud card panel and blue-black scrim.'],
    ['BasicTabsView', 'HorizontalScrollView + LinearLayout', 'Pill or underline active indicator.']
  ];

  for (const [name, base, note] of items) {
    const item = auto('Mapping / ' + name, 'VERTICAL', { p: 18, gap: 8, fill: C.sand50, radius: 18, stroke: C.sand300 });
    item.resize(250, 150);
    item.counterAxisSizingMode = 'FIXED';
    append(item, text('Class Name', name, 17, C.wood700, 'Bold'));
    append(item, text('Base Type', base, 13, C.teal600, 'Semi Bold', 210));
    append(item, text('Note', note, 12, C.wood400, 'Regular', 210));
    append(grid, item);
  }
  append(root, grid);

  const rules = auto('Implementation Rules', 'VERTICAL', { p: 20, gap: 10, fill: C.teal50, radius: 24, stroke: C.teal400 });
  append(rules, text('Rules Title', 'Implementation rules', 20, C.wood700, 'Bold'));
  append(rules, text('Rule 1', 'No hardcoded hex colors in Java widgets. Resolve semantic tokens through BasicThemeManager.', 14, C.wood600, 'Medium', 860));
  append(rules, text('Rule 2', 'No hardcoded dp/sp values in widgets. Read radius, spacing, control height, and typography from style tokens.', 14, C.wood600, 'Medium', 860));
  append(rules, text('Rule 3', 'Use GradientDrawable and StateListDrawable before creating custom drawing code.', 14, C.wood600, 'Medium', 860));
  append(root, rules);
}

function createPreviewPage() {
  let page = figma.root.children.find(p => p.name === '03 Theme Preview');
  if (!page) page = figma.createPage();
  page.name = '03 Theme Preview';
  return page;
}

function addPreview(page) {
  const board = frame('Android Preview Board', 80, 80, 980, 980, C.sand200);
  page.appendChild(board);
  const root = auto('Preview Content', 'HORIZONTAL', { p: 48, gap: 48, align: 'MIN' });
  board.appendChild(root);

  const phone = auto('Android 390x844 / Basic Controls', 'VERTICAL', { p: 24, gap: 18, fill: C.sand200, radius: 42, stroke: C.wood700, strokeWidth: 4 });
  phone.resize(390, 844);
  phone.counterAxisSizingMode = 'FIXED';
  append(phone, text('App Title', 'Basic Controls', 28, C.wood700, 'Bold'));
  append(phone, text('App Subtitle', 'Token driven Android View components', 13, C.wood300, 'Medium'));
  append(phone, makeInput('Search controls', 'default'), true);
  const quick = auto('Quick Actions', 'HORIZONTAL', { gap: 10 });
  append(quick, makeButton('Primary', 'primary', 'sm'));
  append(quick, makeButton('Dashed', 'dashed', 'sm'));
  append(phone, quick);
  append(phone, makeCard('Theme tokens', 'Change two JSON files to reskin colors, radius, and sizes.', C.sand50), true);
  append(phone, makeCard('Java + XML', 'BasicThemeManager resolves semantic tokens for classic Android View.', C.teal50), true);
  const row = auto('Settings Row', 'HORIZONTAL', { gap: 16, align: 'CENTER' });
  append(row, makeCheckbox('云海主题', true));
  append(row, makeSwitch(true));
  append(phone, row);
  append(phone, makeButton('Open modal', 'primary', 'lg'), true);
  append(root, phone);

  const modalArea = auto('Modal Overlay Example', 'VERTICAL', { p: 36, gap: 18, fill: C.wood700, opacity: 0.35, radius: 36, align: 'CENTER', primaryAlign: 'CENTER' });
  modalArea.resize(420, 600);
  modalArea.counterAxisSizingMode = 'FIXED';
  modalArea.primaryAxisSizingMode = 'FIXED';
  append(modalArea, makeModal());
  append(root, modalArea);

  const notes = auto('Implementation Notes', 'VERTICAL', { p: 24, gap: 14, fill: C.sand50, radius: 24, stroke: C.sand300 });
  notes.resize(360, 600);
  notes.counterAxisSizingMode = 'FIXED';
  append(notes, text('Notes Title', 'Android View Mapping', 24, C.wood700, 'Bold'));
  append(notes, text('Note 1', 'color_token.json -> BasicControlsColors', 15, C.wood600, 'Semi Bold'));
  append(notes, text('Note 2', 'style_token.json -> BasicControlsStyle', 15, C.wood600, 'Semi Bold'));
  append(notes, text('Note 3', 'Components use semantic tokens only: brand.primary, background.surface, border.default, radius.pill, size.controlHeight.md.', 14, C.wood400, 'Regular', 300));
  append(notes, text('Note 4', 'Modal shape: Figma uses a rounded cloud card; Android View uses GradientDrawable corner radius 36dp.', 14, C.wood400, 'Regular', 300));
  append(root, notes);
}

await loadFonts();
const originalPage = figma.currentPage;
const tokenPage = createColorPage();
await figma.setCurrentPageAsync(tokenPage);
addTokenBoards(tokenPage);

const componentsPage = createComponentsPage();
await figma.setCurrentPageAsync(componentsPage);
addComponents(componentsPage);

const mappingPage = createMappingPage();
await figma.setCurrentPageAsync(mappingPage);
addMapping(mappingPage);

const previewPage = createPreviewPage();
await figma.setCurrentPageAsync(previewPage);
addPreview(previewPage);

await figma.setCurrentPageAsync(previewPage);
figma.viewport.scrollAndZoomIntoView(previewPage.children);
mutatedNodeIds.push(originalPage.id, tokenPage.id, componentsPage.id, mappingPage.id, previewPage.id);

return {
  createdNodeIds,
  mutatedNodeIds,
  pages: ['00 Tokens', '01 Components', '02 Android View Mapping', '03 Theme Preview'],
  message: 'Created Basic Controls Sky Planet token boards, Java + Android View component specs, mapping notes, and Android preview.'
};
