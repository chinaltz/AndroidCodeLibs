package com.techfun.basiccontrols.widget;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.TextView;

import com.techfun.basiccontrols.R;
import com.techfun.basiccontrols.drawable.BasicDrawableFactory;
import com.techfun.basiccontrols.theme.BasicColors;
import com.techfun.basiccontrols.theme.BasicStyle;
import com.techfun.basiccontrols.theme.BasicThemeManager;

/**
 * 岛屿风格按钮。
 *
 * <p>这个组件不继承 Button，是因为需要做 animal-island-ui 风格的“上层按钮面 +
 * 下层托起阴影”。FrameLayout 更适合管理两个层级：shadowLayer 和 labelView。</p>
 */
public class BasicButton extends FrameLayout {
    public static final String VARIANT_DEFAULT = "default";
    public static final String VARIANT_PRIMARY = "primary";
    public static final String VARIANT_DANGER = "danger";
    public static final String VARIANT_TEXT = "text";
    public static final String VARIANT_LINK = "link";

    /** 底部托起阴影层，模拟轻游戏感的 3D 按钮底座。 */
    private final View shadowLayer;
    /** 按钮可见内容层，负责承载文字和按压位移。 */
    private final TextView labelView;

    private String variant = VARIANT_DEFAULT;
    private boolean basicDisabled;

    public BasicButton(Context context) {
        this(context, null);
    }

    public BasicButton(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public BasicButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        shadowLayer = new View(context);
        labelView = new TextView(context);
        labelView.setGravity(Gravity.CENTER);
        labelView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        addView(shadowLayer);
        addView(labelView);
        readAttrs(attrs);
        refreshTheme();
        setClickable(true);
    }

    /** 设置按钮变体，例如 primary/default/danger/text/link。 */
    public void setVariant(String variant) {
        this.variant = variant == null ? VARIANT_DEFAULT : variant;
        refreshTheme();
    }

    /** 设置按钮文案。 */
    public void setBasicText(CharSequence text) {
        labelView.setText(text);
    }

    /** Button 没有业务选中态，这里保留统一接口，方便上层按统一组件协议调用。 */
    public void setSelectedState(boolean selected) {
        setSelected(selected);
    }

    /** 设置禁用态，并同步刷新颜色和交互。 */
    public void setBasicDisabled(boolean disabled) {
        basicDisabled = disabled;
        setEnabled(!disabled);
        refreshTheme();
    }

    /**
     * 按当前 token 重新绘制按钮。
     *
     * <p>换肤后调用这个方法即可让已有按钮读取新主题。</p>
     */
    public void refreshTheme() {
        BasicColors colors = BasicThemeManager.colors();
        BasicStyle style = BasicThemeManager.style();
        int fill;
        int text;
        int stroke;
        if (VARIANT_PRIMARY.equals(variant)) {
            fill = colors.buttonPrimaryBackground;
            text = colors.buttonPrimaryText;
            stroke = colors.buttonPrimaryBackground;
        } else if (VARIANT_DANGER.equals(variant)) {
            fill = colors.statusDanger;
            text = colors.textInverse;
            stroke = colors.statusDanger;
        } else if (VARIANT_TEXT.equals(variant) || VARIANT_LINK.equals(variant)) {
            fill = colors.backgroundSurface;
            text = colors.brandPrimary;
            stroke = colors.backgroundSurface;
        } else {
            fill = colors.buttonDefaultBackground;
            text = colors.buttonDefaultText;
            stroke = colors.borderControl;
        }
        if (basicDisabled || !isEnabled()) {
            fill = colors.backgroundSurfaceDisabled;
            text = colors.textDisabled;
            stroke = colors.borderLight;
        }

        labelView.setTextColor(text);
        labelView.setTextSize(TypedValue.COMPLEX_UNIT_PX, style.textMd);
        labelView.setBackground(BasicDrawableFactory.roundedFillStroke(
                fill,
                stroke,
                style.borderDefault,
                style.radiusPill
        ));
        shadowLayer.setBackground(BasicDrawableFactory.roundedFill(
                colors.buttonRaisedShadow,
                style.radiusPill
        ));
        requestLayout();
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean handled = super.onTouchEvent(event);
        if (!isEnabled()) {
            return handled;
        }
        BasicStyle style = BasicThemeManager.style();
        if (event.getActionMasked() == MotionEvent.ACTION_DOWN) {
            // 按下时内容层向下移动，模拟“按钮被压下去”的岛屿风格反馈。
            labelView.setTranslationY(style.pressedDropY);
        } else if (event.getActionMasked() == MotionEvent.ACTION_UP
                || event.getActionMasked() == MotionEvent.ACTION_CANCEL) {
            labelView.setTranslationY(0f);
        }
        return handled;
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        BasicStyle style = BasicThemeManager.style();
        int minWidth = Math.round(TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                88,
                getResources().getDisplayMetrics()
        ));
        int desiredHeight = Math.round(style.controlHeightButtonMedium + style.shadowControlIslandLiftY);
        int width = resolveSize(Math.max(minWidth, getSuggestedMinimumWidth()), widthMeasureSpec);
        int height = resolveSize(desiredHeight, heightMeasureSpec);
        int childHeight = Math.max(0, height - Math.round(style.shadowControlIslandLiftY));
        int exactWidth = MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY);
        int exactChildHeight = MeasureSpec.makeMeasureSpec(childHeight, MeasureSpec.EXACTLY);
        labelView.measure(exactWidth, exactChildHeight);
        shadowLayer.measure(exactWidth, exactChildHeight);
        setMeasuredDimension(width, height);
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        BasicStyle style = BasicThemeManager.style();
        int width = right - left;
        int height = bottom - top;
        int lift = Math.round(style.shadowControlIslandLiftY);
        int contentHeight = Math.max(0, height - lift);
        shadowLayer.layout(0, lift, width, lift + contentHeight);
        labelView.layout(0, 0, width, contentHeight);
    }

    /** 从 XML 读取统一 BasicView 属性。 */
    private void readAttrs(AttributeSet attrs) {
        if (attrs == null) {
            return;
        }
        TypedArray array = getContext().obtainStyledAttributes(attrs, R.styleable.BasicView);
        try {
            String xmlVariant = array.getString(R.styleable.BasicView_basicVariant);
            String xmlText = array.getString(R.styleable.BasicView_basicText);
            variant = xmlVariant == null ? VARIANT_DEFAULT : xmlVariant;
            basicDisabled = array.getBoolean(R.styleable.BasicView_basicDisabled, false);
            if (xmlText != null) {
                labelView.setText(xmlText);
            }
            setEnabled(!basicDisabled);
        } finally {
            array.recycle();
        }
    }
}
