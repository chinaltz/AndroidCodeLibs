package com.androidcodelibs.androidutilslib.view;

import android.content.Context;
import android.support.v4.view.ViewPager;
import android.util.AttributeSet;
import android.view.GestureDetector;
import android.view.GestureDetector.SimpleOnGestureListener;
import android.view.MotionEvent;
import android.widget.ScrollView;


/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Info scrollView与内部ViewPager滑动的XY冲突
 */
public class ALInnerViewPager extends ViewPager {

	/** 父滚动布局 */
	private ScrollView parentScrollView;

	/** 手势. */
	private GestureDetector mGestureDetector;
	
	/**
	 * 构造函数.
	 * @param context the context
	 */
	public ALInnerViewPager(Context context) {
		super(context);
		mGestureDetector = new GestureDetector(new YScrollDetector());
		setFadingEdgeLength(0);
	}

	/**
	 * 构造函数.
	 * @param context the context
	 * @param attrs the attrs
	 */
	public ALInnerViewPager(Context context, AttributeSet attrs) {
		super(context, attrs);
		mGestureDetector = new GestureDetector(new YScrollDetector());
		setFadingEdgeLength(0);
	}
	
	/**
	 * 拦截事件.
	 *
	 * @param ev the ev
	 * @return true, if successful
	 */
	@Override
	public boolean onInterceptTouchEvent(MotionEvent ev) {
		return super.onInterceptTouchEvent(ev)
				&& mGestureDetector.onTouchEvent(ev);
	}

	/**
	 * 设置父级的View.
	 * @param flag 父是否滚动开关
	 */
	private void setParentScrollAble(boolean flag) {
		if(parentScrollView!=null){
			parentScrollView.requestDisallowInterceptTouchEvent(!flag);
		}

	}

	/**
	 * 如果外层有ScrollView需要设置.
	 * @param parentScrollView the new parent scroll view
	 */
	public void setParentScrollView(ScrollView parentScrollView) {
		this.parentScrollView = parentScrollView;
	}

	
	/**
	 * 手势类.
	 */
	class YScrollDetector extends SimpleOnGestureListener {
		
		@Override
		public boolean onScroll(MotionEvent e1, MotionEvent e2,
				float distanceX, float distanceY) {
			
			if (Math.abs(distanceX) >= Math.abs(distanceY)) {
				//父亲不滑动
				setParentScrollAble(false);
				return true;
			}else{
				setParentScrollAble(true);
			}
			return false;
		}
	}

	

}
