package com.androidcodelibs.androidutilslib.utils;

import android.content.ComponentCallbacks;
import android.content.Context;
import android.content.res.Configuration;
import android.support.annotation.Nullable;
import android.util.DisplayMetrics;

/**
 * 通过修改系统参数来适配android设备
 * 今日头条解决方案
 * https://mp.weixin.qq.com/s/d9QCoBP6kV9VSWvVldVVwA
 * Created by 李挺哲 2018/07/30.
 */

public class DensityUtils {

    private static float appDensity;
    private static float appScaledDensity;
    private static DisplayMetrics appDisplayMetrics;
    private static int barHeight;
    private static int appDensityDpi;


    public final static String WIDTH = "width";

    public final static String HEIGHT = "height";


    public static float designHeight = 667.0f;

    public static float designWidth = 360.0f;

    public static void initDensity() {
        //获取application的DisplayMetrics
        appDisplayMetrics = Utils.getApp().getResources().getDisplayMetrics();
        //获取状态栏高度
        barHeight = BarUtils.getStatusBarHeight();

        if (appDensity == 0) {
            //初始化的时候赋值
            appDensity = appDisplayMetrics.density;
            appScaledDensity = appDisplayMetrics.scaledDensity;
            appDensityDpi=appDisplayMetrics.densityDpi;
            //添加字体变化的监听
            Utils.getApp().registerComponentCallbacks(new ComponentCallbacks() {
                @Override
                public void onConfigurationChanged(Configuration newConfig) {
                    //字体改变后,将appScaledDensity重新赋值
                    if (newConfig != null && newConfig.fontScale > 0) {
                        appScaledDensity = Utils.getApp().getResources().getDisplayMetrics().scaledDensity;
                    }
                }

                @Override
                public void onLowMemory() {
                }
            });
        }
    }

    //此方法在BaseActivity中做初始化(如果不封装BaseActivity的话,直接用下面那个方法就好)
    public static void setDefault(Context activity) {
        setAppOrientation(activity, WIDTH);
    }

    //此方法用于在某一个Activity里面更改适配的方向
    public static void setOrientation(Context activity, String orientation) {
        setAppOrientation(activity, orientation);
    }

    /**
     * targetDensity
     * targetScaledDensity
     * targetDensityDpi
     * 这三个参数是统一修改过后的值
     * <p>
     * orientation:方向值,传入width或height
     */
    private static void setAppOrientation(@Nullable Context activity, String orientation) {

        float targetDensity;

        if (orientation.equals("height")) {
            targetDensity = (appDisplayMetrics.heightPixels - barHeight) / designHeight;
        } else {
            targetDensity = appDisplayMetrics.widthPixels / designWidth;
        }

        float targetScaledDensity = targetDensity * (appScaledDensity / appDensity);
        int targetDensityDpi = (int) (160 * targetDensity);

        /**
         *
         * 最后在这里将修改过后的值赋给系统参数
         *
         * 只修改Activity的density值
         */
        DisplayMetrics activityDisplayMetrics = activity.getResources().getDisplayMetrics();
        activityDisplayMetrics.density = targetDensity;
        activityDisplayMetrics.scaledDensity = targetScaledDensity;
        activityDisplayMetrics.densityDpi = targetDensityDpi;
    }



//    还原 dpi


    public  static  void resetDpi(Context context){
        DisplayMetrics activityDisplayMetrics = context.getResources().getDisplayMetrics();
        activityDisplayMetrics.density = appDensity;
        activityDisplayMetrics.scaledDensity = appScaledDensity;
        activityDisplayMetrics.densityDpi = appDensityDpi;
    }
}
