package com.techfun.basiccontrols.samples;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.techfun.basiccontrols.theme.BasicColors;
import com.techfun.basiccontrols.theme.BasicStyle;
import com.techfun.basiccontrols.theme.BasicThemeManager;
import com.techfun.basiccontrols.widget.BasicAlertView;
import com.techfun.basiccontrols.widget.BasicBadgeView;
import com.techfun.basiccontrols.widget.BasicButton;
import com.techfun.basiccontrols.widget.BasicCardView;
import com.techfun.basiccontrols.widget.BasicCheckboxView;
import com.techfun.basiccontrols.widget.BasicChipView;
import com.techfun.basiccontrols.widget.BasicCodeBlockView;
import com.techfun.basiccontrols.widget.BasicCollapseView;
import com.techfun.basiccontrols.widget.BasicDividerView;
import com.techfun.basiccontrols.widget.BasicEmptyView;
import com.techfun.basiccontrols.widget.BasicInputView;
import com.techfun.basiccontrols.widget.BasicListItemView;
import com.techfun.basiccontrols.widget.BasicLoadingDialog;
import com.techfun.basiccontrols.widget.BasicLoadingView;
import com.techfun.basiccontrols.widget.BasicModalDialog;
import com.techfun.basiccontrols.widget.BasicRefreshLayout;
import com.techfun.basiccontrols.widget.BasicProgressView;
import com.techfun.basiccontrols.widget.BasicRadioView;
import com.techfun.basiccontrols.widget.BasicSelectView;
import com.techfun.basiccontrols.widget.BasicSwitchView;
import com.techfun.basiccontrols.widget.BasicTableView;
import com.techfun.basiccontrols.widget.BasicTabsView;
import com.techfun.basiccontrols.widget.BasicToast;
import com.techfun.basiccontrols.widget.BasicTypewriterView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Basic Controls 可运行样例页面。
 *
 * <p>这个 Sample App 不依赖 Compose、Kotlin、AppCompat 或 Material，所有界面都用
 * 传统 Android View + Java 代码创建，便于验证 library 在老 View 体系中的真实效果。</p>
 */
public class MainActivity extends Activity {
    private BasicColors colors;
    private BasicStyle style;
    private LinearLayout content;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        BasicThemeManager.init(this);
        colors = BasicThemeManager.colors();
        style = BasicThemeManager.style();
        setContentView(createContentView());
    }

    /** 创建整页可滚动样例内容。 */
    private View createContentView() {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(colors.backgroundPage);

        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(20), dp(18), dp(20), dp(32));
        scrollView.addView(content, new ScrollView.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        addHeader();
        addButtonSamples();
        addDividerSamples();
        addInputSamples();
        addSelectSamples();
        addCardSamples();
        addCollapseSamples();
        addAlertSamples();
        addBadgeSamples();
        addChipSamples();
        addSelectionSamples();
        addSwitchSamples();
        addProgressSamples();
        addDataDisplaySamples();
        addListItemSamples();
        addEmptySamples();
        addTabsSamples();
        addModalSamples();
        addToastSamples();
        BasicRefreshLayout refreshLayout = new BasicRefreshLayout(this);
        refreshLayout.setContentView(scrollView);
        refreshLayout.setOnRefreshLoadListener(new BasicRefreshLayout.OnRefreshLoadListener() {
            @Override
            public void onRefresh() {
                handler.postDelayed(() -> {
                    BasicToast.show(MainActivity.this, "技趣星球已刷新", "success", Toast.LENGTH_SHORT);
                    refreshLayout.finishRefresh();
                }, 1200L);
            }

            @Override
            public void onLoadMore() {
                handler.postDelayed(() -> {
                    BasicToast.show(MainActivity.this, "已经加载更多组件", "info", Toast.LENGTH_SHORT);
                    refreshLayout.finishLoadMore();
                }, 1200L);
            }
        });
        return refreshLayout;
    }

    /** 顶部标题区域，用于说明当前样例运行的是 Java + Android View 组件库。 */
    private void addHeader() {
        TextView title = text("技趣星球 Basic Controls", style.textTitle, colors.textPrimary, true);
        content.addView(title, fullWidth());
        TextView subtitle = text("用技术创造乐趣 · Java + classic Android View / no Compose", style.textMd, colors.textSecondary, false);
        content.addView(subtitle, withTopMargin(6));
    }

    /** 覆盖 BasicButton 的 primary/default/danger/text/link/disabled/pressed 场景。 */
    private void addButtonSamples() {
        addSectionTitle("Buttons");
        content.addView(button("Primary island button", BasicButton.VARIANT_PRIMARY, false), withTopMargin(10));
        content.addView(button("Default button", BasicButton.VARIANT_DEFAULT, false), withTopMargin(10));
        content.addView(button("Danger button", BasicButton.VARIANT_DANGER, false), withTopMargin(10));
        content.addView(button("Text button", BasicButton.VARIANT_TEXT, false), withTopMargin(10));
        content.addView(button("Link button", BasicButton.VARIANT_LINK, false), withTopMargin(10));
        content.addView(button("Disabled primary", BasicButton.VARIANT_PRIMARY, true), withTopMargin(10));
    }

    /** 覆盖 Divider 分隔场景。 */
    private void addDividerSamples() {
        addSectionTitle("Divider");
        content.addView(new BasicDividerView(this), withTopMargin(10));
    }

    /** 覆盖 BasicInputView 的默认、焦点、错误、禁用场景。 */
    private void addInputSamples() {
        addSectionTitle("Inputs");
        BasicInputView normal = new BasicInputView(this);
        normal.getEditText().setHint("Default input");
        content.addView(normal, withTopMargin(10));

        BasicInputView filled = new BasicInputView(this);
        filled.setBasicText("已输入内容");
        filled.getEditText().setHint("Filled input");
        content.addView(filled, withTopMargin(10));

        BasicInputView error = new BasicInputView(this);
        error.setVariant(BasicInputView.VARIANT_ERROR);
        error.getEditText().setHint("Error input");
        content.addView(error, withTopMargin(10));

        BasicInputView disabled = new BasicInputView(this);
        disabled.setBasicText("Disabled input");
        disabled.setBasicDisabled(true);
        content.addView(disabled, withTopMargin(10));
    }

    /** 覆盖 Select 下拉选择场景。 */
    private void addSelectSamples() {
        addSectionTitle("Select");
        BasicSelectView select = new BasicSelectView(this);
        select.setOptions(Arrays.asList("全部主题", "AI 工具", "Android", "网页小工具"));
        select.setOnOptionSelectedListener((index, option) ->
                BasicToast.show(this, "选择：" + option, "info", Toast.LENGTH_SHORT));
        content.addView(select, withTopMargin(10));

        BasicSelectView disabled = new BasicSelectView(this);
        disabled.setOptions(Arrays.asList("不可选择", "草稿", "已发布"));
        disabled.setBasicDisabled(true);
        content.addView(disabled, withTopMargin(10));
    }

    /** 覆盖 BasicCardView 的默认、subtle、selected 场景。 */
    private void addCardSamples() {
        addSectionTitle("Cards");
        BasicCardView card = card("默认云朵卡片", "用于表单块、列表项和信息面板。");
        content.addView(card, withTopMargin(10));

        BasicCardView subtle = card("Subtle card", "更轻的 surface，用于页面里的弱强调区域。");
        subtle.setVariant("subtle");
        content.addView(subtle, withTopMargin(10));

        BasicCardView selected = card("Selected card", "选中态会使用品牌色边框，便于选择类场景。");
        selected.setSelectedState(true);
        content.addView(selected, withTopMargin(10));
    }

    /** 覆盖 Collapse 折叠问答场景。 */
    private void addCollapseSamples() {
        addSectionTitle("Collapse");
        BasicCollapseView first = new BasicCollapseView(this);
        first.setTitle("为什么坚持 Java + Android View？");
        first.setMessage("为了兼容老项目、降低接入成本，并且不引入 Compose 迁移成本。");
        first.setSelectedState(true);
        content.addView(first, withTopMargin(10));

        BasicCollapseView second = new BasicCollapseView(this);
        second.setTitle("换肤需要改组件代码吗？");
        second.setMessage("不需要。稳定维护 color_token.json 和 style_token.json，即可驱动 Android 与 Figma 的一致换肤。");
        content.addView(second, withTopMargin(10));
    }

    /** 覆盖 BasicAlertView 的 info/success/warning/error 场景。 */
    private void addAlertSamples() {
        addSectionTitle("Alerts");
        content.addView(alert("Info", "蓝色星球信息提示。", BasicAlertView.VARIANT_INFO), withTopMargin(10));
        content.addView(alert("Success", "操作已经完成，可以继续下一步。", BasicAlertView.VARIANT_SUCCESS), withTopMargin(10));
        content.addView(alert("Warning", "请检查当前输入内容。", BasicAlertView.VARIANT_WARNING), withTopMargin(10));
        content.addView(alert("Error", "提交失败，请稍后重试。", BasicAlertView.VARIANT_ERROR), withTopMargin(10));
    }

    /** 覆盖 BasicBadgeView 的 default/primary/success/warning/danger/disabled 场景。 */
    private void addBadgeSamples() {
        addSectionTitle("Badges");
        LinearLayout row = horizontalWrap();
        row.addView(badge("Default", "default", false));
        row.addView(badge("Primary", "primary", false));
        row.addView(badge("Success", "success", false));
        row.addView(badge("Warning", "warning", false));
        row.addView(badge("Danger", "danger", false));
        row.addView(badge("Disabled", "default", true));
        content.addView(row, withTopMargin(10));
    }

    /** 覆盖 BasicChipView 的筛选、状态和选中场景。 */
    private void addChipSamples() {
        addSectionTitle("Chips");
        LinearLayout row = horizontalWrap();
        row.addView(chip("AI 工具", "primary", true));
        row.addView(chip("Android", "default", false));
        row.addView(chip("已发布", "success", false));
        row.addView(chip("待检查", "warning", false));
        row.addView(chip("需修复", "danger", false));
        content.addView(row, withTopMargin(10));
    }

    /** 覆盖 Checkbox 和 Radio 的常见选择场景。 */
    private void addSelectionSamples() {
        addSectionTitle("Selection");
        BasicCheckboxView agree = new BasicCheckboxView(this);
        agree.setBasicText("订阅技趣星球更新");
        agree.setSelectedState(true);
        content.addView(agree, withTopMargin(10));

        BasicCheckboxView disabled = new BasicCheckboxView(this);
        disabled.setBasicText("禁用的复选项");
        disabled.setBasicDisabled(true);
        content.addView(disabled, withTopMargin(10));

        LinearLayout group = new LinearLayout(this);
        group.setOrientation(LinearLayout.VERTICAL);
        BasicRadioView beginner = radio("零基础教程", true);
        BasicRadioView android = radio("Android 组件库", false);
        BasicRadioView aiTool = radio("AI 小工具", false);
        BasicRadioView[] radios = new BasicRadioView[]{beginner, android, aiTool};
        for (BasicRadioView radio : radios) {
            radio.setOnClickListener(view -> {
                for (BasicRadioView item : radios) {
                    item.setSelectedState(item == view);
                }
            });
            group.addView(radio, withTopMargin(8));
        }
        content.addView(group, fullWidth());
    }

    /** 覆盖 BasicSwitchView 的开启、关闭和禁用场景。 */
    private void addSwitchSamples() {
        addSectionTitle("Switches");
        BasicSwitchView publish = new BasicSwitchView(this);
        publish.setBasicText("开启发布提醒");
        publish.setCheckedText("开");
        publish.setUncheckedText("关");
        publish.setSelectedState(true);
        content.addView(publish, withTopMargin(10));

        BasicSwitchView draft = new BasicSwitchView(this);
        draft.setBasicText("自动保存草稿");
        draft.setCheckedText("ON");
        draft.setUncheckedText("OFF");
        content.addView(draft, withTopMargin(10));

        BasicSwitchView small = new BasicSwitchView(this);
        small.setBasicText("小号开关");
        small.setVariant(BasicSwitchView.SIZE_SMALL);
        small.setCheckedText("Y");
        small.setUncheckedText("N");
        small.setSelectedState(true);
        content.addView(small, withTopMargin(10));

        BasicSwitchView loading = new BasicSwitchView(this);
        loading.setBasicText("同步主题中");
        loading.setSelectedState(true);
        loading.setLoading(true);
        content.addView(loading, withTopMargin(10));

        BasicSwitchView disabled = new BasicSwitchView(this);
        disabled.setBasicText("禁用的实验功能");
        disabled.setBasicDisabled(true);
        content.addView(disabled, withTopMargin(10));
    }

    /** 覆盖确定性进度条和不确定加载条。 */
    private void addProgressSamples() {
        addSectionTitle("Progress & Loading");
        BasicProgressView article = new BasicProgressView(this);
        article.setProgress(0.68f);
        content.addView(article, withTopMargin(12));

        BasicProgressView warning = new BasicProgressView(this);
        warning.setVariant("warning");
        warning.setProgress(0.36f);
        content.addView(warning, withTopMargin(12));

        BasicLoadingView loading = new BasicLoadingView(this);
        loading.setBasicText("技趣星球加载中");
        content.addView(loading, withTopMargin(12));

        content.addView(loadingDialogButton(), withTopMargin(12));
    }

    /** 覆盖 Table、CodeBlock、Typewriter 数据展示场景。 */
    private void addDataDisplaySamples() {
        addSectionTitle("Data Display");
        BasicTableView table = new BasicTableView(this);
        List<List<String>> rows = new ArrayList<>();
        rows.add(Arrays.asList("Switch", "已补齐", "核心"));
        rows.add(Arrays.asList("Select", "新增", "常用"));
        rows.add(Arrays.asList("Collapse", "新增", "常用"));
        table.setData(Arrays.asList("组件", "状态", "优先级"), rows);
        content.addView(table, withTopMargin(10));

        BasicCodeBlockView code = new BasicCodeBlockView(this);
        code.setTitle("Java");
        code.setCode("BasicThemeManager.init(this);\\nBasicButton button = new BasicButton(this);\\nbutton.setVariant(BasicButton.VARIANT_PRIMARY);");
        content.addView(code, withTopMargin(10));

        BasicTypewriterView typewriter = new BasicTypewriterView(this);
        typewriter.setBasicText("技趣星球：用技术创造乐趣，把组件、主题和代码生成流程都做成可复用能力。");
        content.addView(typewriter, withTopMargin(10));
    }

    /** 覆盖 BasicListItemView 的工具入口、选中和禁用场景。 */
    private void addListItemSamples() {
        addSectionTitle("List Items");
        BasicListItemView app = listItem("AI 帮你做 Android App", "从需求到可运行 Demo", "⭐⭐⭐", false, false);
        content.addView(app, withTopMargin(10));

        BasicListItemView selected = listItem("组件库搭建计划", "Token、Theme、View 组件", "进行中", true, false);
        content.addView(selected, withTopMargin(10));

        BasicListItemView disabled = listItem("视频特效工作流", "后续阶段开放", "未开始", false, true);
        content.addView(disabled, withTopMargin(10));
    }

    /** 覆盖 BasicEmptyView 的空内容场景。 */
    private void addEmptySamples() {
        addSectionTitle("Empty State");
        BasicEmptyView empty = new BasicEmptyView(this);
        empty.setTitle("还没有生成工具卡片");
        empty.setMessage("选择一个技趣星球主题，先做一个能跑起来的小工具。");
        empty.setActionText("开始创建");
        empty.getActionButton().setOnClickListener(view ->
                BasicToast.show(this, "准备创建新工具", "success", Toast.LENGTH_SHORT));
        content.addView(empty, withTopMargin(10));
    }

    /** 覆盖 BasicTabsView 的默认选中和点击切换场景。 */
    private void addTabsSamples() {
        addSectionTitle("Tabs");
        BasicTabsView tabs = new BasicTabsView(this);
        tabs.setTabs(Arrays.asList("基础", "表单", "反馈", "导航", "数据"));
        tabs.setOnTabSelectedListener((index, title) ->
                BasicToast.show(this, "已选择：" + title, "info", Toast.LENGTH_SHORT));
        content.addView(tabs, withTopMargin(10));
    }

    /** 覆盖 Modal 模态弹窗场景。 */
    private void addModalSamples() {
        addSectionTitle("Modal");
        BasicButton modal = button("Show modal dialog", BasicButton.VARIANT_PRIMARY, false);
        modal.setOnClickListener(view -> {
            BasicModalDialog dialog = BasicModalDialog.show(this, "确认同步主题", "将当前 token 应用到 Android View 组件和 Figma 设计稿。");
            dialog.setOnConfirmClickListener(confirm ->
                    BasicToast.show(this, "已确认同步", "success", Toast.LENGTH_SHORT));
        });
        content.addView(modal, withTopMargin(10));
    }

    /** 覆盖 BasicToast 的 info/success/warning/error 场景。 */
    private void addToastSamples() {
        addSectionTitle("Toasts");
        BasicButton info = button("Show info toast", BasicButton.VARIANT_PRIMARY, false);
        info.setOnClickListener(view -> BasicToast.show(this, "Info toast", "info", Toast.LENGTH_SHORT));
        content.addView(info, withTopMargin(10));

        BasicButton success = button("Show success toast", BasicButton.VARIANT_DEFAULT, false);
        success.setOnClickListener(view -> BasicToast.show(this, "Success toast", "success", Toast.LENGTH_SHORT));
        content.addView(success, withTopMargin(10));

        BasicButton warning = button("Show warning toast", BasicButton.VARIANT_DEFAULT, false);
        warning.setOnClickListener(view -> BasicToast.show(this, "Warning toast", "warning", Toast.LENGTH_SHORT));
        content.addView(warning, withTopMargin(10));

        BasicButton error = button("Show error toast", BasicButton.VARIANT_DANGER, false);
        error.setOnClickListener(view -> BasicToast.show(this, "Error toast", "error", Toast.LENGTH_SHORT));
        content.addView(error, withTopMargin(10));
    }

    /** 添加一个分组标题。 */
    private void addSectionTitle(String title) {
        TextView view = text(title, style.textLg, colors.textPrimary, true);
        content.addView(view, withTopMargin(24));
    }

    /** 创建按钮样例。 */
    private BasicButton button(String label, String variant, boolean disabled) {
        BasicButton button = new BasicButton(this);
        button.setBasicText(label);
        button.setVariant(variant);
        button.setBasicDisabled(disabled);
        if (!disabled) {
            button.setOnClickListener(view -> BasicToast.show(this, label, "info", Toast.LENGTH_SHORT));
        }
        return button;
    }

    /** 创建半透明 Loading 弹窗演示按钮。 */
    private BasicButton loadingDialogButton() {
        BasicButton button = button("Show planet loading dialog", BasicButton.VARIANT_PRIMARY, false);
        button.setOnClickListener(view -> {
            BasicLoadingDialog dialog = BasicLoadingDialog.show(this, "技趣星球同步中...");
            handler.postDelayed(dialog::dismiss, 1800L);
        });
        return button;
    }

    /** 创建卡片样例。 */
    private BasicCardView card(String title, String body) {
        BasicCardView card = new BasicCardView(this);
        LinearLayout inner = new LinearLayout(this);
        inner.setOrientation(LinearLayout.VERTICAL);
        inner.addView(text(title, style.textMd, colors.textPrimary, true), fullWidth());
        inner.addView(text(body, style.textSm, colors.textSecondary, false), withTopMargin(4));
        card.addView(inner, fullWidth());
        return card;
    }

    /** 创建提示条样例。 */
    private BasicAlertView alert(String title, String message, String variant) {
        BasicAlertView alert = new BasicAlertView(this);
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setVariant(variant);
        return alert;
    }

    /** 创建徽标样例。 */
    private BasicBadgeView badge(String text, String variant, boolean disabled) {
        BasicBadgeView badge = new BasicBadgeView(this);
        badge.setBasicText(text);
        badge.setVariant(variant);
        badge.setBasicDisabled(disabled);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, dp(8), dp(8));
        badge.setLayoutParams(params);
        return badge;
    }

    /** 创建标签样例。 */
    private BasicChipView chip(String text, String variant, boolean selected) {
        BasicChipView chip = new BasicChipView(this);
        chip.setBasicText(text);
        chip.setVariant(variant);
        chip.setSelectedState(selected);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, dp(8), dp(8));
        chip.setLayoutParams(params);
        return chip;
    }

    /** 创建单选项样例。 */
    private BasicRadioView radio(String text, boolean selected) {
        BasicRadioView radio = new BasicRadioView(this);
        radio.setBasicText(text);
        radio.setSelectedState(selected);
        return radio;
    }

    /** 创建列表项样例。 */
    private BasicListItemView listItem(String title, String message, String trailing, boolean selected, boolean disabled) {
        BasicListItemView item = new BasicListItemView(this);
        item.setTitle(title);
        item.setMessage(message);
        item.setTrailingText(trailing);
        item.setSelectedState(selected);
        item.setBasicDisabled(disabled);
        return item;
    }

    /** 创建基础文本。 */
    private TextView text(String value, float sizePx, int color, boolean bold) {
        TextView textView = new TextView(this);
        textView.setText(value);
        textView.setTextColor(color);
        textView.setTextSize(TypedValue.COMPLEX_UNIT_PX, sizePx);
        textView.setTypeface(android.graphics.Typeface.DEFAULT, bold
                ? android.graphics.Typeface.BOLD
                : android.graphics.Typeface.NORMAL);
        return textView;
    }

    /** 横向自动换行的简单容器。当前用 LinearLayout 承载，宽度不足时可横向滚动页面观察。 */
    private LinearLayout horizontalWrap() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        return row;
    }

    /** 全宽自适应高度布局参数。 */
    private LinearLayout.LayoutParams fullWidth() {
        return new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );
    }

    /** 带顶部间距的全宽布局参数。 */
    private LinearLayout.LayoutParams withTopMargin(int topDp) {
        LinearLayout.LayoutParams params = fullWidth();
        params.setMargins(0, dp(topDp), 0, 0);
        return params;
    }

    /** dp 转 px。 */
    private int dp(float value) {
        return Math.round(TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                value,
                getResources().getDisplayMetrics()
        ));
    }
}
