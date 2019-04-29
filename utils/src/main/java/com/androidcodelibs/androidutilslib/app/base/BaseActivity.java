package com.androidcodelibs.androidutilslib.app.base;


import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.androidcodelibs.androidutilslib.utils.DensityUtils;


/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/11 下午3:23.
 * Info 所有Activity要继承这个父类，便于统一管理
 */
public abstract class BaseActivity extends AppCompatActivity {
    public Context mContext;
    private long lastClick;

    @Override
    protected void onCreate(Bundle savedInstanceState) {


        super.onCreate(savedInstanceState);
        mContext = this;
        DensityUtils.setDefault(mContext);


    }


    /**
     * 判断是否快速点击
     *
     * @return {@code true}: 是<br>{@code false}: 否
     */
    private boolean isFastClick() {
        long now = System.currentTimeMillis();
        if (now - lastClick >= 200) {
            lastClick = now;
            return false;
        }
        return true;
    }


}

