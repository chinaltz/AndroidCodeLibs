
package com.androidcodelibs.androidutilslib.view.refresh;

import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.animation.Animation;
import android.view.animation.RotateAnimation;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.androidcodelibs.androidutilslib.utils.DateUtils;
import com.androidcodelibs.androidutilslib.utils.ViewUtils;
import com.isoftstone.androidutilslib.R;
//import ViewUtils;


/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/11 下午3:23.
 * Info 下拉刷新的Header View类
 */
public class ALListViewHeader extends ALListViewBaseHeader {
	
	/** 主View. */
	private LinearLayout headerView;
	
	/** 箭头图标View. */
	private ImageView arrowImageView;
	
	/** 进度图标View. */
	private ProgressBar headerProgressBar;
	
	/** 文本提示的View. */
	private TextView tipsTextview;
	
	/** 时间的View. */
	private TextView headerTimeView;
	
	/** 向上的动画. */
	private Animation mRotateUpAnim;
	
	/** 向下的动画. */
	private Animation mRotateDownAnim;
	
	/** 动画时间. */
	private final int ROTATE_ANIM_DURATION = 180;

	
	/** 保存上一次的刷新时间. */
	private String lastRefreshTime = null;
	
	/**  Header的高度. */
	private int headerHeight;

	/**
	 * 初始化Header.
	 * @param context the context
	 */
	public ALListViewHeader(Context context) {
		super(context);
		initView();
	}

	/**
	 * 初始化View.
	 */
	private void initView() {

		//顶部刷新栏整体内容
		headerView = new LinearLayout(context);
		headerView.setOrientation(HORIZONTAL);
		headerView.setGravity(Gravity.CENTER);

		headerView.setPadding( 0, 10, 0, 10);
//		ViewUtils.setPadding(headerView,);
		
		//显示箭头与进度
		FrameLayout headImage =  new FrameLayout(context);
		arrowImageView = new ImageView(context);

		//箭头图片
		arrowImageView.setImageResource(R.drawable.arrow);
		
		//style="?android:attr/progressBarStyleSmall" 默认的样式
		headerProgressBar = new ProgressBar(context,null,android.R.attr.progressBarStyle);
		headerProgressBar.setVisibility(GONE);
		
		LinearLayout.LayoutParams layoutParamsWW = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
		layoutParamsWW.gravity = Gravity.CENTER;
		layoutParamsWW.width = 50;
		layoutParamsWW.height = 50 ;
		headImage.addView(arrowImageView,layoutParamsWW);
		headImage.addView(headerProgressBar,layoutParamsWW);
		
		//顶部刷新栏文本内容
		LinearLayout headTextLayout  = new LinearLayout(context);
		tipsTextview = new TextView(context);
		headerTimeView = new TextView(context);
		headTextLayout.setOrientation(VERTICAL);
		headTextLayout.setGravity(Gravity.CENTER_VERTICAL);

		headTextLayout.setPadding(0, 0, 0, 0);
		LinearLayout.LayoutParams layoutParamsWW2 = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
		headTextLayout.addView(tipsTextview,layoutParamsWW2);
		headTextLayout.addView(headerTimeView,layoutParamsWW2);
		tipsTextview.setTextColor(Color.rgb(107, 107, 107));
		headerTimeView.setTextColor(Color.rgb(107, 107, 107));
		tipsTextview.setTextSize(  15);
		headerTimeView.setTextSize( 12);
		
		LinearLayout.LayoutParams layoutParamsWW3 = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
		layoutParamsWW3.gravity = Gravity.CENTER;
		layoutParamsWW3.rightMargin =  10 ;
		
		LinearLayout headerLayout = new LinearLayout(context);
		headerLayout.setOrientation(HORIZONTAL);
		headerLayout.setGravity(Gravity.CENTER);
		
		headerLayout.addView(headImage,layoutParamsWW3);
		headerLayout.addView(headTextLayout,layoutParamsWW3);
		
		LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.FILL_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
		lp.gravity = Gravity.BOTTOM;
		//添加大布局
		headerView.addView(headerLayout,lp);
		
		this.addView(headerView,lp);
		//获取View的高度
		ViewUtils.measureView(this);
		headerHeight = this.getMeasuredHeight();
		
		mRotateUpAnim = new RotateAnimation(0.0f, -180.0f,
				Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF,
				0.5f);
		mRotateUpAnim.setDuration(ROTATE_ANIM_DURATION);
		mRotateUpAnim.setFillAfter(true);
		mRotateDownAnim = new RotateAnimation(-180.0f, 0.0f,
				Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF,
				0.5f);
		mRotateDownAnim.setDuration(ROTATE_ANIM_DURATION);
		mRotateDownAnim.setFillAfter(true);
		
		setState(STATE_NORMAL);
	}

	/**
	 * 设置状态.
	 * @param state the new state
	 */
	public void setState(int state) {
		if (state == currentState) return ;
		
		switch(state){
			case STATE_NORMAL:

				arrowImageView.setVisibility(VISIBLE);
				headerProgressBar.setVisibility(INVISIBLE);

				if (currentState == STATE_READY) {
					arrowImageView.startAnimation(mRotateDownAnim);
				}
				if (currentState == STATE_REFRESHING) {
					arrowImageView.clearAnimation();
				}
				tipsTextview.setText("下拉刷新");
				
				if(lastRefreshTime==null){
					lastRefreshTime = DateUtils.getCurrentDate(DateUtils.dateFormatHMS);
					headerTimeView.setText("刷新时间：" + lastRefreshTime);
				}else{
					headerTimeView.setText("上次刷新时间：" + lastRefreshTime);
				}
				
				break;
			case STATE_READY:

				arrowImageView.setVisibility(VISIBLE);
				headerProgressBar.setVisibility(INVISIBLE);

				if (currentState != STATE_READY) {
					arrowImageView.clearAnimation();
					arrowImageView.startAnimation(mRotateUpAnim);
					tipsTextview.setText("松开刷新");
					headerTimeView.setText("上次刷新时间：" + lastRefreshTime);
					lastRefreshTime = DateUtils.getCurrentDate(DateUtils.dateFormatHMS);
					
				}
				break;
			case STATE_REFRESHING:

				arrowImageView.clearAnimation();
				arrowImageView.setVisibility(INVISIBLE);
				headerProgressBar.setVisibility(VISIBLE);

				tipsTextview.setText("正在刷新...");
				headerTimeView.setText("本次刷新时间：" + lastRefreshTime);
				break;
				default:
			}
		
		currentState = state;
	}
	
	/**
	 * 设置header可见的高度.
	 * @param height the new visiable height
	 */
	public void setVisiableHeight(int height) {
		if (height < 0) height = 0;
		LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) headerView.getLayoutParams();
		lp.height = height;
		headerView.setLayoutParams(lp);
	}

	/**
	 * 获取header可见的高度.
	 * @return the visiable height
	 */
	public int getVisiableHeight() {
		LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams)headerView.getLayoutParams();
		return lp.height;
	}

	/**
	 * 获取HeaderView.
	 * @return the header view
	 */
	public LinearLayout getHeaderView() {
		return headerView;
	}
	
	/**
	 * 设置上一次刷新时间.
	 * @param time 时间字符串
	 */
	public void setRefreshTime(String time) {
		headerTimeView.setText(time);
	}

	/**
	 * 获取header的高度.
	 * @return 高度
	 */
	public int getHeaderHeight() {
		return headerHeight;
	}
	
	/**
	 * 设置字体颜色.
	 * @param color the new text color
	 */
	public void setTextColor(int color){
		tipsTextview.setTextColor(color);
		headerTimeView.setTextColor(color);
	}
	
	/**
	 * 设置背景颜色.
	 * @param color the new background color
	 */
	public void setBackgroundColor(int color){
		headerView.setBackgroundColor(color);
	}

	/**
	 * 获取Header ProgressBar，用于设置自定义样式.
	 * @return the header progress bar
	 */
	public ProgressBar getHeaderProgressBar() {
		return headerProgressBar;
	}

	/**
	 * 设置Header ProgressBar样式.
	 * @param indeterminateDrawable the new header progress bar drawable
	 */
	public void setHeaderProgressBarDrawable(Drawable indeterminateDrawable) {
		headerProgressBar.setIndeterminateDrawable(indeterminateDrawable);
	}

	/**
	 * 得到当前状态.
	 * @return the state
	 */
    public int getState(){
        return currentState;
    }

	/**
	 * 设置提示状态文字的大小.
	 *
	 * @param size the new state text size
	 */
	public void setStateTextSize(int size) {
		tipsTextview.setTextSize(TypedValue.COMPLEX_UNIT_PX,size);
	}

	/**
	 * 设置提示时间文字的大小.
	 *
	 * @param size the new time text size
	 */
	public void setTimeTextSize(int size) {
		headerTimeView.setTextSize(TypedValue.COMPLEX_UNIT_PX,size);
	}

	/**
	 * 获取箭头的ImageView.
	 * @return the arrow image view
	 */
	public ImageView getArrowImageView() {
		return arrowImageView;
	}

	/**
	 * 设置箭头的图标.
	 * @param resId the new arrow image
	 */
	public void setArrowImage(int resId) {
		this.arrowImageView.setImageResource(resId);
	}

    /**
     * 获取提示文字View
     * @return
     */
	public TextView getTipsTextview() {
		return tipsTextview;
	}

    /**
     * 获取提示时间View
     * @return
     */
	public TextView getHeaderTimeView() {
		return headerTimeView;
	}

}
