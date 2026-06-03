import React, { useEffect, useMemo, useState } from 'react';
import { componentCategories, componentDocs } from '../../shared/componentDocs.js';
import { starPlanetTheme, starPlanetThemes, themeVars } from './theme.js';

export { starPlanetTheme, starPlanetThemes, themeVars };

const h = React.createElement;
const cx = (...names) => names.filter(Boolean).join(' ');
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || min));
const optionText = (option) => typeof option === 'object' && option !== null ? option.title ?? option.text ?? option.label ?? option.value : option;

function themed(theme, style) {
  return { ...themeVars(theme), ...style };
}

export function TspButton({
  text,
  variant = 'default',
  disabled = false,
  fullWidth = true,
  theme = starPlanetTheme,
  onTap,
  children
}) {
  return h(
    'button',
    {
      type: 'button',
      disabled,
      className: cx('bc-button', `bc-button--${variant}`, fullWidth && 'bc-full', disabled && 'bc-disabled'),
      style: themed(theme),
      onClick: disabled ? undefined : onTap
    },
    h('span', { className: 'bc-button__shadow' }),
    h('span', { className: 'bc-button__face' }, children ?? text)
  );
}

export function TspCard({ variant = 'default', selected = false, disabled = false, content, theme = starPlanetTheme, children }) {
  return h(
    'section',
    {
      className: cx('bc-card', `bc-card--${variant}`, selected && 'bc-selected', disabled && 'bc-disabled'),
      style: themed(theme)
    },
    children ?? content
  );
}

export function TspAlert({ title, message, variant = 'info', theme = starPlanetTheme }) {
  return h(
    'section',
    { className: cx('bc-alert', `bc-alert--${variant}`), style: themed(theme), role: 'status' },
    title && h('div', { className: 'bc-alert__title' }, title),
    message && h('div', { className: 'bc-alert__message' }, message)
  );
}

export function TspBadge({ text, variant = 'default', disabled = false, theme = starPlanetTheme }) {
  return h('span', { className: cx('bc-badge', `bc-badge--${variant}`, disabled && 'bc-disabled'), style: themed(theme) }, text);
}

export function TspChip({ text, variant = 'default', selected = false, disabled = false, theme = starPlanetTheme, onTap }) {
  return h(
    'button',
    {
      type: 'button',
      disabled,
      className: cx('bc-chip', `bc-chip--${variant}`, selected && 'bc-selected', disabled && 'bc-disabled'),
      style: themed(theme),
      onClick: disabled ? undefined : onTap
    },
    text
  );
}

export function TspInput({ value = '', placeholder = '', variant = 'default', disabled = false, theme = starPlanetTheme, onChange }) {
  return h('input', {
    className: cx('bc-input', `bc-input--${variant}`),
    style: themed(theme),
    value,
    placeholder,
    disabled,
    onChange: (event) => onChange?.(event.target.value)
  });
}

export function TspSelect({ options = [], selectedIndex = 0, disabled = false, theme = starPlanetTheme, onSelect }) {
  const [open, setOpen] = useState(false);
  const selected = options[selectedIndex];
  return h(
    React.Fragment,
    null,
    h(
      'button',
      {
        type: 'button',
        className: cx('bc-select', disabled && 'bc-disabled'),
        style: themed(theme),
        disabled,
        onClick: disabled ? undefined : () => setOpen(true)
      },
      h('span', null, optionText(selected) ?? ''),
      h('span', { className: 'bc-select__chevron' }, '⌄')
    ),
    h(TspOptionSheet, {
      title: '请选择',
      options,
      selectedIndex,
      visible: open,
      theme,
      onCancel: () => setOpen(false),
      onSelect: (index, option) => {
        setOpen(false);
        onSelect?.(index, option);
      }
    })
  );
}

export function TspOptionSheet({ title = '请选择', options = [], selectedIndex = 0, visible = false, theme = starPlanetTheme, onSelect, onCancel }) {
  if (!visible) return null;
  return h(
    'div',
    { className: 'bc-option-sheet', style: themed(theme), role: 'dialog', 'aria-modal': 'true' },
    h('button', { type: 'button', className: 'bc-option-sheet__mask', 'aria-label': 'Close', onClick: onCancel }),
    h(
      'section',
      { className: 'bc-option-sheet__panel' },
      h('div', { className: 'bc-option-sheet__header' },
        h('button', { type: 'button', onClick: onCancel }, '取消'),
        h('strong', null, title),
        h('span', null)
      ),
      h('div', { className: 'bc-option-sheet__options' },
        options.map((option, index) => h(
          'button',
          {
            key: `${optionText(option)}-${index}`,
            type: 'button',
            className: cx('bc-option-sheet__option', index === selectedIndex && 'bc-selected'),
            onClick: () => onSelect?.(index, option)
          },
          h('span', { className: 'bc-option-sheet__check' }, index === selectedIndex ? '✓' : ''),
          h('span', null, optionText(option))
        ))
      )
    )
  );
}

export function TspSwitch({
  text,
  checked = false,
  checkedText = '',
  uncheckedText = '',
  loading = false,
  disabled = false,
  theme = starPlanetTheme,
  onChange
}) {
  const label = checked ? checkedText : uncheckedText;
  return h(
    'button',
    {
      type: 'button',
      disabled: disabled || loading,
      className: cx('bc-switch', checked && 'bc-checked', loading && 'bc-loading', disabled && 'bc-disabled'),
      style: themed(theme),
      onClick: disabled || loading ? undefined : () => onChange?.(!checked)
    },
    h('span', { className: 'bc-switch__track' }, h('span', { className: 'bc-switch__thumb' })),
    (text || label) && h('span', { className: 'bc-switch__text' }, text || label)
  );
}

export function TspProgress({ progress = 0, variant = 'primary', theme = starPlanetTheme }) {
  const percent = clamp(progress, 0, 100);
  return h('div', { className: cx('bc-progress', `bc-progress--${variant}`), style: themed(theme), role: 'progressbar', 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('span', { style: { width: `${percent}%` } }));
}

export function TspTopBar({ title, showBack = false, backgroundColor, theme = starPlanetTheme, onBack }) {
  return h(
    'header',
    { className: 'bc-top-bar', style: themed(theme, backgroundColor ? { backgroundColor } : undefined) },
    showBack && h('button', { type: 'button', className: 'bc-top-bar__back', onClick: onBack, 'aria-label': 'Back' }, '‹'),
    h('div', { className: 'bc-top-bar__title' }, title)
  );
}

export function TspBottomTab({ tabs = [], selectedKey, theme = starPlanetTheme, onSelect }) {
  return h(
    'nav',
    { className: 'bc-bottom-tab', style: themed(theme) },
    tabs.map((tab) => h(
      'button',
      {
        key: tab.key,
        type: 'button',
        className: cx('bc-bottom-tab__item', tab.key === selectedKey && 'bc-selected'),
        onClick: () => onSelect?.(tab.key, tab)
      },
      tab.icon && h('span', { className: 'bc-bottom-tab__icon' }, tab.icon),
      h('span', null, tab.title ?? tab.text ?? tab.key)
    ))
  );
}

export function TspTabs({ tabs = [], selectedIndex = 0, theme = starPlanetTheme, onSelect }) {
  return h(
    'div',
    { className: 'bc-tabs', style: themed(theme), role: 'tablist' },
    tabs.map((tab, index) => h(
      'button',
      {
        key: `${tab}-${index}`,
        type: 'button',
        className: cx('bc-tabs__item', index === selectedIndex && 'bc-selected'),
        role: 'tab',
        'aria-selected': index === selectedIndex,
        onClick: () => onSelect?.(index, tab)
      },
      tab
    ))
  );
}

export function TspAmount({ symbol = '¥', value, cycle = '', symbolAfter = false, strikeThrough = false, theme = starPlanetTheme }) {
  return h(
    'span',
    { className: cx('bc-amount', strikeThrough && 'bc-strike'), style: themed(theme) },
    !symbolAfter && h('span', { className: 'bc-amount__symbol' }, symbol),
    h('span', { className: 'bc-amount__value' }, value),
    symbolAfter && h('span', { className: 'bc-amount__symbol' }, symbol),
    cycle && h('span', { className: 'bc-amount__cycle' }, `/${cycle}`)
  );
}

export function TspIconButton({ icon, selected = false, disabled = false, variant = 'default', theme = starPlanetTheme, onTap }) {
  return h(
    'button',
    {
      type: 'button',
      disabled,
      className: cx('bc-icon-button', `bc-icon-button--${variant}`, selected && 'bc-selected', disabled && 'bc-disabled'),
      style: themed(theme),
      onClick: disabled ? undefined : onTap
    },
    icon
  );
}

export function TspKeyValueLabel({ label, value, theme = starPlanetTheme }) {
  return h('div', { className: 'bc-key-value', style: themed(theme) }, h('span', null, label), h('strong', null, value));
}

export function TspNotification({ title, message, variant = 'info', theme = starPlanetTheme }) {
  return h(
    'section',
    { className: cx('bc-notification', `bc-notification--${variant}`), style: themed(theme) },
    title && h('strong', null, title),
    message && h('span', null, message)
  );
}

export function TspTextLink({ text, inverse = false, theme = starPlanetTheme, onTap }) {
  return h('button', { type: 'button', className: cx('bc-text-link', inverse && 'bc-text-link--inverse'), style: themed(theme), onClick: onTap }, text);
}

export function TspStepper({ stepCount = 3, currentStep = 1, theme = starPlanetTheme }) {
  const count = clamp(stepCount, 3, 5);
  const current = clamp(currentStep, 1, count);
  return h(
    'div',
    { className: 'bc-stepper', style: themed(theme) },
    Array.from({ length: count }, (_, index) => {
      const step = index + 1;
      const done = step < current;
      const active = step === current;
      return h(React.Fragment, { key: step },
        h('span', { className: cx('bc-stepper__dot', done && 'bc-done', active && 'bc-active') }, done ? '✓' : step),
        step < count && h('span', { className: cx('bc-stepper__line', done && 'bc-done') })
      );
    })
  );
}

export function TspStickyFooter({ content, theme = starPlanetTheme, children }) {
  return h('footer', { className: 'bc-sticky-footer', style: themed(theme) }, children ?? content);
}

export function TspPinInput({ value = '', cellCount = 4, secure = false, theme = starPlanetTheme, onComplete, onChange }) {
  const count = clamp(cellCount, 4, 6);
  const chars = value.slice(0, count).split('');
  return h(
    'label',
    { className: 'bc-pin-input', style: themed(theme) },
    h('input', {
      value,
      maxLength: count,
      inputMode: 'numeric',
      onInput: (event) => {
        const next = event.target.value.slice(0, count);
        onChange?.(next);
        if (next.length === count) onComplete?.(next);
      }
    }),
    Array.from({ length: count }, (_, index) => h('span', { key: index, className: 'bc-pin-input__cell' }, secure && chars[index] ? '•' : chars[index] ?? ''))
  );
}

export function TspListItem({ title, message, trailing, selected = false, disabled = false, theme = starPlanetTheme, onTap }) {
  return h(
    'button',
    { type: 'button', disabled, className: cx('bc-list-item', selected && 'bc-selected', disabled && 'bc-disabled'), style: themed(theme), onClick: disabled ? undefined : onTap },
    h('span', { className: 'bc-list-item__body' }, h('strong', null, title), message && h('span', null, message)),
    trailing && h('span', { className: 'bc-list-item__trailing' }, trailing)
  );
}

export function TspEmpty({ title, message, actionText, theme = starPlanetTheme, onAction }) {
  return h(
    'section',
    { className: 'bc-empty', style: themed(theme) },
    h('div', { className: 'bc-empty__mark' }, '○'),
    title && h('strong', null, title),
    message && h('span', null, message),
    actionText && h(TspButton, { text: actionText, variant: 'primary', fullWidth: false, theme, onTap: onAction })
  );
}

export function TspToast({ message, variant = 'info', duration = 1800, theme = starPlanetTheme }) {
  return h('div', { className: cx('bc-toast', `bc-toast--${variant}`), style: themed(theme), role: 'status', 'data-duration': duration }, message);
}

export function TspModal({ title, message, confirmText = 'OK', cancelText = 'Cancel', theme = starPlanetTheme, onConfirm, onCancel }) {
  return h(
    'div',
    { className: 'bc-modal', style: themed(theme), role: 'dialog', 'aria-modal': 'true' },
    h('section', { className: 'bc-modal__panel' },
      title && h('h3', null, title),
      message && h('p', null, message),
      h('div', { className: 'bc-modal__actions' },
        h(TspButton, { text: cancelText, variant: 'default', theme, onTap: onCancel }),
        h(TspButton, { text: confirmText, variant: 'primary', theme, onTap: onConfirm })
      )
    )
  );
}

const sampleLocales = {
  'zh-CN': {
    title: '基础组件',
    themeSwitch: '主题切换',
    languageSwitch: '语言切换',
    pageSwitch: '页面切换',
    themeHint: '切换主题后，页面、组件、弹窗和 Toast 同步变更。',
    languageHint: '切换语言后，样例文案从内置 JSON 字典读取。',
    primary: '主按钮',
    default: '默认按钮',
    danger: '危险按钮',
    card: '卡片',
    cardBody: '星球主题内容卡片。',
    success: '成功',
    applied: '主题已应用。',
    badge: '徽标',
    chip: '标签',
    input: '输入框',
    switch: '开关',
    progress: '进度',
    notice: '通知',
    noticeBody: '继续学习。',
    listItem: '列表项',
    selectedState: '选中状态',
    empty: '空状态',
    emptyBody: '暂无记录。',
    action: '操作',
    showToast: '显示 Toast',
    openModal: '打开弹窗',
    stickyFooter: '底部固定操作',
    modalTitle: '确认',
    modalBody: '弹窗遵循同一套组件契约，并验证移动端高度、滚动和底部按钮完整显示。',
    cancel: '取消',
    ok: '确定'
  },
  en: {
    title: 'Basic Controls',
    themeSwitch: 'Theme Switch',
    languageSwitch: 'Language Switch',
    pageSwitch: 'Page Switch',
    themeHint: 'Theme changes update the page, components, modal and toast.',
    languageHint: 'Sample text is loaded from the built-in JSON dictionary.',
    primary: 'Primary',
    default: 'Default',
    danger: 'Danger',
    card: 'Card',
    cardBody: 'Star Planet surface card.',
    success: 'Success',
    applied: 'Theme is applied.',
    badge: 'Badge',
    chip: 'Chip',
    input: 'Input',
    switch: 'Switch',
    progress: 'Progress',
    notice: 'Notice',
    noticeBody: 'Keep learning.',
    listItem: 'List item',
    selectedState: 'Selected state',
    empty: 'Empty',
    emptyBody: 'No records yet.',
    action: 'Action',
    showToast: 'Show Toast',
    openModal: 'Open Modal',
    stickyFooter: 'Sticky Footer',
    modalTitle: 'Confirm',
    modalBody: 'The modal follows the same contract and verifies mobile height, scrolling and visible actions.',
    cancel: 'Cancel',
    ok: 'OK'
  },
  ja: {
    title: '基本コンポーネント',
    themeSwitch: 'テーマ切替',
    languageSwitch: '言語切替',
    pageSwitch: 'ページ切替',
    themeHint: 'テーマ変更はページ、部品、モーダル、トーストへ反映されます。',
    languageHint: 'サンプル文言は内蔵 JSON 辞書から読み込みます。',
    primary: '主要ボタン',
    default: '標準ボタン',
    danger: '危険ボタン',
    card: 'カード',
    cardBody: '星球テーマのカード。',
    success: '成功',
    applied: 'テーマを適用しました。',
    badge: 'バッジ',
    chip: 'チップ',
    input: '入力',
    switch: 'スイッチ',
    progress: '進捗',
    notice: '通知',
    noticeBody: '学習を続けましょう。',
    listItem: 'リスト項目',
    selectedState: '選択状態',
    empty: '空状態',
    emptyBody: '記録はありません。',
    action: '操作',
    showToast: 'Toast 表示',
    openModal: 'モーダルを開く',
    stickyFooter: '固定フッター',
    modalTitle: '確認',
    modalBody: 'モーダルは同じ契約に従い、モバイル高さとスクロールを検証します。',
    cancel: '取消',
    ok: 'OK'
  }
};

// Keep every component page visual-first: examples exercise states without exposing code snippets.
function TspDocPreview({ name, theme, state }) {
  const common = { theme };
  const example = (title, node) => h('div', { className: 'bc-example-item' }, h('div', { className: 'bc-example-title' }, title), node);
  switch (name) {
    case 'Button': return h('div', { className: 'bc-example-stack' }, ['primary', 'default', 'danger', 'text'].map((variant) => example(variant, h(TspButton, { text: variant, variant, ...common }))));
    case 'Card': return h('div', { className: 'bc-example-stack' }, example('default', h(TspCard, common, h('strong', null, 'Card'), h('p', null, 'Star Planet card.'))), example('selected', h(TspCard, { selected: true, ...common }, 'Selected card')));
    case 'Alert': return h('div', { className: 'bc-example-stack' }, ['info', 'success', 'warning', 'error'].map((variant) => example(variant, h(TspAlert, { title: variant, message: 'Theme is applied.', variant, ...common }))));
    case 'Badge': return h('div', { className: 'bc-row' }, ['default', 'primary', 'success', 'warning', 'danger'].map((variant) => h(TspBadge, { key: variant, text: variant, variant, ...common })));
    case 'Chip': return h('div', { className: 'bc-row' }, h(TspChip, { text: 'Default', ...common }), h(TspChip, { text: 'Selected', selected: true, ...common }), h(TspChip, { text: 'Disabled', disabled: true, ...common }));
    case 'Input': return h('div', { className: 'bc-example-stack' }, example('default', h(TspInput, { value: state.inputValue, placeholder: 'Input', onChange: state.setInputValue, ...common })), example('error', h(TspInput, { value: '', placeholder: 'Required', variant: 'error', ...common })));
    case 'Select': return h(TspSelect, { options: ['A', 'B', 'C'], selectedIndex: state.selectedOption, onSelect: state.setSelectedOption, ...common });
    case 'OptionSheet': return h(TspButton, { text: 'Open OptionSheet', variant: 'primary', onTap: () => state.setShowSheet(true), ...common });
    case 'Switch': return h('div', { className: 'bc-example-stack' }, example('checked', h(TspSwitch, { text: 'Switch', checked: state.checked, onChange: state.setChecked, ...common })), example('loading', h(TspSwitch, { text: 'Loading', checked: true, loading: true, ...common })));
    case 'Progress': return h('div', { className: 'bc-example-stack' }, ['primary', 'success', 'warning', 'danger'].map((variant, index) => example(variant, h(TspProgress, { progress: [38, 68, 52, 82][index], variant, ...common }))));
    case 'TopBar': return h(TspTopBar, { title: '基础组件', showBack: true, ...common });
    case 'BottomTab': return h('div', { className: 'bc-doc-sticky-demo' }, h(TspBottomTab, { tabs: state.tabs, selectedKey: state.tab, onSelect: state.setTab, ...common }));
    case 'Tabs': return h(TspTabs, { tabs: ['全部', '已学', '未学'], selectedIndex: state.selectedTab, onSelect: state.setSelectedTab, ...common });
    case 'Amount': return h('div', { className: 'bc-example-stack' }, example('monthly', h(TspAmount, { symbol: '$', value: '128.80', cycle: 'month', ...common })), example('strike', h(TspAmount, { symbol: '$', value: '199.00', strikeThrough: true, ...common })));
    case 'IconButton': return h('div', { className: 'bc-row' }, h(TspIconButton, { icon: '♪', selected: true, ...common }), h(TspIconButton, { icon: '✓', variant: 'primary', ...common }), h(TspIconButton, { icon: '×', disabled: true, ...common }));
    case 'KeyValueLabel': return h(TspKeyValueLabel, { label: 'Progress', value: '12/48', ...common });
    case 'Notification': return h('div', { className: 'bc-example-stack' }, example('info', h(TspNotification, { title: '通知', message: '继续学习。', ...common })), example('alert', h(TspNotification, { title: '提醒', message: '今日任务未完成。', variant: 'alert', ...common })));
    case 'TextLink': return h('div', { className: 'bc-row' }, h(TspTextLink, { text: 'Text Link', ...common }), h(TspTextLink, { text: 'Inverse', inverse: true, ...common }));
    case 'Stepper': return h('div', { className: 'bc-example-stack' }, example('3 steps', h(TspStepper, { stepCount: 3, currentStep: 2, ...common })), example('5 steps', h(TspStepper, { stepCount: 5, currentStep: 3, ...common })));
    case 'StickyFooter': return h('div', { className: 'bc-doc-sticky-demo' }, h(TspButton, { text: 'Sticky Footer', variant: 'primary', ...common }));
    case 'PinInput': return h('div', { className: 'bc-example-stack' }, example('secure', h(TspPinInput, { value: state.pinValue, cellCount: 4, secure: true, onChange: state.setPinValue, ...common })), example('6 cells', h(TspPinInput, { value: '123', cellCount: 6, ...common })));
    case 'ListItem': return h('div', { className: 'bc-example-stack' }, example('selected', h(TspListItem, { title: '列表项', message: '选中状态', trailing: '›', selected: true, ...common })), example('disabled', h(TspListItem, { title: '不可点击', message: '禁用状态', disabled: true, ...common })));
    case 'Empty': return h(TspEmpty, { title: '空状态', message: '暂无记录。', actionText: '操作', ...common });
    case 'Toast': return h(TspButton, { text: 'Show Toast', variant: 'primary', onTap: () => state.showToast('已保存', 'success'), ...common });
    case 'Modal': return h(TspButton, { text: 'Open Modal', onTap: () => state.setShowModal(true), ...common });
    default: return null;
  }
}

function ComponentDocPage({ doc, theme, state, onBack }) {
  return h(
    'main',
    { className: 'bc-sample', style: themed(theme) },
    h(TspTopBar, { title: doc.component, showBack: true, theme, onBack }),
    h('section', { className: 'bc-sample__grid bc-doc-page' },
      h(TspCard, { theme },
        h('div', { className: 'bc-doc-eyebrow' }, doc.category),
        h('h1', { className: 'bc-doc-title' }, doc.component),
        h('p', { className: 'bc-doc-desc' }, doc.description)
      ),
      h(TspCard, { theme },
        h('strong', null, '使用案例'),
        h('div', { className: 'bc-doc-preview' }, h(TspDocPreview, { name: doc.name, theme, state }))
      ),
      h(TspCard, { theme },
        h('strong', null, 'API'),
        h('div', { className: 'bc-doc-section-title' }, 'Props'),
        h('div', { className: 'bc-doc-chip-row' }, doc.props.map((prop) => h('span', { key: prop, className: 'bc-doc-chip' }, prop))),
        h('div', { className: 'bc-doc-section-title' }, 'Variants'),
        h('div', { className: 'bc-doc-chip-row' }, doc.variants.map((variant) => h('span', { key: variant, className: 'bc-doc-chip' }, variant)))
      ),
      h(TspCard, { theme },
        h('strong', null, '技术栈同步'),
        h('div', { className: 'bc-doc-chip-row' }, doc.platforms.map((platform) => h('span', { key: platform, className: 'bc-doc-chip' }, platform)))
      )
    ),
    state.showSheet && h(TspOptionSheet, {
      title: '请选择',
      options: ['A', 'B', 'C'],
      selectedIndex: state.selectedOption,
      theme,
      visible: true,
      onCancel: () => state.setShowSheet(false),
      onSelect: (index) => {
        state.setSelectedOption(index);
        state.setShowSheet(false);
      }
    }),
    state.toast && h('div', { className: 'bc-toast-layer', key: state.toast.id }, h(TspToast, { message: state.toast.message, variant: state.toast.variant, theme })),
    state.showModal && h(TspModal, {
      title: '确认',
      message: '组件弹窗在详情页中也需要完整显示。',
      confirmText: '确定',
      cancelText: '取消',
      theme,
      onConfirm: () => state.setShowModal(false),
      onCancel: () => state.setShowModal(false)
    })
  );
}

export function BasicControlsSample() {
  const themeOptions = useMemo(() => [
    { key: 'sky', title: 'Sky' },
    { key: 'night', title: 'Night' },
    { key: 'mint', title: 'Mint' },
    { key: 'sunrise', title: 'Sunrise' }
  ], []);
  const languageOptions = useMemo(() => [
    { key: 'zh-CN', title: '简体中文' },
    { key: 'en', title: 'English' },
    { key: 'ja', title: '日本語' }
  ], []);
  const [themeKey, setThemeKey] = useState('sky');
  const [locale, setLocale] = useState('zh-CN');
  const theme = starPlanetThemes[themeKey];
  const t = (key) => sampleLocales[locale][key] ?? sampleLocales.en[key] ?? key;
  const [checked, setChecked] = useState(true);
  const [tab, setTab] = useState('learn');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOption, setSelectedOption] = useState(1);
  const [pinValue, setPinValue] = useState('12');
  const [inputValue, setInputValue] = useState('');
  const [showSheet, setShowSheet] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState(() => window.location.hash.replace(/^#/, ''));
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const tabs = useMemo(() => [{ key: 'learn', title: '学习', icon: '⌂' }, { key: 'settings', title: '设置', icon: '⚙' }], []);
  const showToast = (message, variant = 'info') => {
    setToast({ message, variant, id: Date.now() });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 1800);
  };
  useEffect(() => {
    const syncFromHash = () => setSelectedDocName(window.location.hash.replace(/^#/, ''));
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);
  const openDoc = (name) => {
    window.location.hash = name;
    setSelectedDocName(name);
  };
  const closeDoc = () => {
    history.pushState('', document.title, window.location.pathname + window.location.search);
    setSelectedDocName('');
  };
  // Hash routing keeps each component page directly shareable without adding a router dependency.
  const selectedDoc = componentDocs.find((doc) => doc.name === selectedDocName);
  const previewState = {
    checked,
    setChecked,
    inputValue,
    setInputValue,
    selectedOption,
    setSelectedOption,
    selectedTab,
    setSelectedTab,
    pinValue,
    setPinValue,
    showSheet,
    setShowSheet,
    showModal,
    setShowModal,
    toast,
    tabs,
    tab,
    setTab,
    showToast
  };
  if (selectedDoc) {
    return h(ComponentDocPage, {
      doc: selectedDoc,
      theme,
      state: previewState,
      onBack: closeDoc
    });
  }
  const settingsPage = h(React.Fragment, null,
    h(TspCard, { theme }, h('strong', null, t('themeSwitch')), h('p', null, t('themeHint')), h(TspSelect, {
      options: themeOptions,
      selectedIndex: themeOptions.findIndex((item) => item.key === themeKey),
      theme,
      onSelect: (_, option) => setThemeKey(option.key)
    })),
    h(TspCard, { theme }, h('strong', null, t('languageSwitch')), h('p', null, t('languageHint')), h(TspSelect, {
      options: languageOptions,
      selectedIndex: languageOptions.findIndex((item) => item.key === locale),
      theme,
      onSelect: (_, option) => setLocale(option.key)
    }))
  );
  const learnPage = componentCategories.map((category) => h('section', { key: category, className: 'bc-doc-home-section' },
    h('div', { className: 'bc-doc-section-title' }, category),
    h('div', { className: 'bc-doc-list' },
      componentDocs.filter((doc) => doc.category === category).map((doc) => h(TspListItem, {
        key: doc.name,
        title: doc.component,
        message: doc.description,
        trailing: '›',
        theme,
        onTap: () => openDoc(doc.name)
      }))
    )
  ));
  return h(
    'main',
    { className: 'bc-sample', style: themed(theme) },
    h(TspTopBar, { title: t('title'), showBack: true, theme }),
    h('section', { className: 'bc-sample__grid' },
      tab === 'settings' ? settingsPage : learnPage
    ),
    toast && h('div', { className: 'bc-toast-layer', key: toast.id }, h(TspToast, { message: toast.message, variant: toast.variant, theme })),
    h(TspBottomTab, { tabs, selectedKey: tab, theme, onSelect: setTab }),
    showModal && h(TspModal, {
      title: t('modalTitle'),
      message: t('modalBody'),
      confirmText: t('ok'),
      cancelText: t('cancel'),
      theme,
      onConfirm: () => setShowModal(false),
      onCancel: () => setShowModal(false)
    })
  );
}
