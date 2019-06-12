package com.androidcodelibs.entity.common;

import java.io.Serializable;

/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/14 下午4:54.
 * 类描述：
 */


public class SampleModel implements Serializable {

    /**
     * 功能名称
     */
    private String title;
    /**
     * 功能图片
     */
    private int drawableId;

    /**
     * 导航路径
     */
    private String navPath;

    public String getNavPath() {
        return navPath;
    }

    public void setNavPath(String navPath) {
        this.navPath = navPath;
    }

    public SampleModel(String title, int drawableId) {
        this.title = title;
        this.drawableId = drawableId;
    }


    public SampleModel(String title, int drawableId, String navPath) {
        this.title = title;
        this.drawableId = drawableId;
        this.navPath = navPath;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getDrawableId() {
        return drawableId;
    }

    public void setDrawableId(int drawableId) {
        this.drawableId = drawableId;
    }
}
