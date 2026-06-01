// Shared contract for sample navigation across React, Vue and the native-stack parity checklist.
const componentSpecs = [
  ['Button', 'Actions', '主要操作按钮，支持主按钮、默认、危险、文本和链接样式。', ['primary', 'default', 'danger', 'text', 'link'], ['text', 'variant', 'disabled', 'fullWidth', 'onTap'], 'text="Primary" variant="primary"'],
  ['Card', 'Surfaces', '内容容器，用于承载分组内容、选中态和弱化背景。', ['default', 'subtle', 'selected', 'disabled'], ['variant', 'selected', 'disabled', 'content'], 'selected content="Star Planet card"'],
  ['Alert', 'Feedback', '页面内提示，适合成功、警告、错误和普通信息。', ['info', 'success', 'warning', 'error'], ['title', 'message', 'variant'], 'title="Success" message="Theme is applied" variant="success"'],
  ['Badge', 'Feedback', '短文本状态徽标，用于标记数量、状态或风险等级。', ['default', 'primary', 'success', 'warning', 'danger'], ['text', 'variant', 'disabled'], 'text="Badge" variant="primary"'],
  ['Chip', 'Actions', '可点击标签，用于筛选、选择和轻量操作。', ['default', 'primary', 'success', 'warning', 'danger'], ['text', 'variant', 'selected', 'disabled', 'onTap'], 'text="Chip" selected'],
  ['Input', 'Inputs', '单行输入框，支持错误态、禁用态和受控输入。', ['default', 'error', 'disabled'], ['value', 'placeholder', 'variant', 'disabled', 'onChange'], 'value={value} placeholder="Input" onChange={setValue}'],
  ['Select', 'Inputs', '选择入口，移动端默认打开底部 OptionSheet。', ['default', 'disabled'], ['options', 'selectedIndex', 'disabled', 'onSelect'], 'options={["A", "B", "C"]} selectedIndex={1}'],
  ['OptionSheet', 'Inputs', '移动端底部选择弹窗，和 Select 共用选项渲染逻辑。', ['default', 'mobile'], ['title', 'options', 'selectedIndex', 'visible', 'onSelect', 'onCancel'], 'title="请选择" options={["A", "B"]} visible'],
  ['Switch', 'Inputs', '二元开关，支持加载、禁用和开关文案。', ['md', 'sm', 'loading', 'disabled'], ['text', 'checked', 'checkedText', 'uncheckedText', 'loading', 'disabled', 'onChange'], 'text="Switch" checked onChange={setChecked}'],
  ['Progress', 'Feedback', '进度条，支持主色、成功、警告和危险色。', ['primary', 'warning', 'success', 'danger'], ['progress', 'variant'], 'progress={68} variant="success"'],
  ['TopBar', 'Navigation', '顶部导航栏，支持标题、返回按钮和背景色覆盖。', ['default'], ['title', 'showBack', 'backgroundColor', 'onBack'], 'title="基础组件" showBack'],
  ['BottomTab', 'Navigation', '一级页面底部 Tab，通常承载 3 到 5 个入口。', ['default'], ['tabs', 'selectedKey', 'onSelect'], 'tabs={tabs} selectedKey="learn"'],
  ['Tabs', 'Navigation', '内容区分段切换，适合页面内筛选和分类。', ['default'], ['tabs', 'selectedIndex', 'onSelect'], 'tabs={["全部", "已学", "未学"]} selectedIndex={0}'],
  ['Amount', 'Data', '金额或数值展示，支持币种前后置、周期和删除线。', ['symbolBefore', 'symbolAfter', 'strikeThrough'], ['symbol', 'value', 'cycle', 'symbolAfter', 'strikeThrough'], 'symbol="$" value="128.80" cycle="month"'],
  ['IconButton', 'Actions', '图标按钮，用于工具栏、快捷动作和选中态。', ['default', 'primary', 'selected', 'disabled'], ['icon', 'selected', 'disabled', 'onTap'], 'icon="♪" selected'],
  ['KeyValueLabel', 'Data', '键值对展示，用于摘要信息和表单确认。', ['default'], ['label', 'value'], 'label="Progress" value="12/48"'],
  ['Notification', 'Feedback', '通知卡片，用于强调当前任务或状态提醒。', ['info', 'alert'], ['title', 'message', 'variant'], 'title="通知" message="继续学习" variant="alert"'],
  ['TextLink', 'Actions', '文本链接按钮，适合弱操作和辅助跳转。', ['default', 'inverse'], ['text', 'inverse', 'onTap'], 'text="Text Link"'],
  ['Stepper', 'Data', '步骤进度，支持 3 到 5 步。', ['3steps', '4steps', '5steps'], ['stepCount', 'currentStep'], 'stepCount={5} currentStep={3}'],
  ['StickyFooter', 'Navigation', '固定底部操作区，用于主操作按钮。', ['default', 'subtle'], ['content'], 'content={<TspButton text="提交" />}'],
  ['PinInput', 'Inputs', '验证码或密码输入，支持 4 到 6 位和安全显示。', ['4cells', '6cells', 'secure'], ['value', 'cellCount', 'secure', 'onComplete'], 'value={pin} cellCount={4} secure'],
  ['ListItem', 'Surfaces', '列表项，支持描述、尾部内容、选中和禁用。', ['default', 'selected', 'disabled'], ['title', 'message', 'trailing', 'selected', 'disabled', 'onTap'], 'title="列表项" message="选中状态" trailing="›" selected'],
  ['Empty', 'Surfaces', '空状态展示，支持说明文案和操作按钮。', ['default'], ['title', 'message', 'actionText', 'onAction'], 'title="空状态" message="暂无记录" actionText="操作"'],
  ['Toast', 'Feedback', '轻提示，用于短时反馈，支持 info/success/warning/error。', ['info', 'success', 'warning', 'error'], ['message', 'variant', 'duration'], 'message="已保存" variant="success" duration={1800}'],
  ['Modal', 'Feedback', '确认弹窗，支持确认和取消按钮。', ['confirm'], ['title', 'message', 'confirmText', 'cancelText', 'onConfirm', 'onCancel'], 'title="确认" message="继续操作吗？"']
];

const reactName = (name) => `Tsp${name}`;

export const componentDocs = componentSpecs.map(([name, category, description, variants, props, exampleProps]) => ({
  name,
  component: reactName(name),
  category,
  description,
  variants,
  props,
  exampleProps,
  platforms: ['React', 'Vue', 'Android', 'iOS', 'Flutter', 'Kuikly', 'React Native', 'Mini Program']
}));

export const componentCategories = [...new Set(componentDocs.map((item) => item.category))];
