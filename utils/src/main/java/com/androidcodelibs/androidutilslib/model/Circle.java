package com.androidcodelibs.androidutilslib.model;



/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/11 下午3:23.
 * Info 圆形模型
 */
public class Circle {
	
	public Point point;
	public double r;

	public Circle() {
		super();
	}

	public Circle(Point point, double r) {
		super();
		this.point = point;
		this.r = r;
	}

	@Override
	public String toString() {
		return "(" + point.x + "," + point.y + "),r="+r;
	}

}
