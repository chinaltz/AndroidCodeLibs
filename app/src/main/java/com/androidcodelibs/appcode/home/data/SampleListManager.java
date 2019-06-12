package com.androidcodelibs.appcode.home.data;

import com.androidcodelibs.appcode.R;
import com.androidcodelibs.entity.common.SampleModel;

import java.util.ArrayList;
import java.util.List;

/**
 * @author:litingzhe
 * @date: 2019/4/30   14:49
 * @description: 功能列表数据管理类
 * @git:https://github.com/chinaltz
 * @简书地址:https://www.jianshu.com/u/3d8c73dff561
 */
public class SampleListManager {


    public static List<SampleModel> getDatas(int dataType) {

        ArrayList<SampleModel> data = new ArrayList();

        switch (dataType) {

            case 0:
                SampleModel sampleModel1 = new SampleModel("常见列表表格布局", R.mipmap.ui_gridview);
                SampleModel sampleModel2 = new SampleModel("下拉刷新", R.mipmap.ui_refresh);
                SampleModel sampleModel3 = new SampleModel("一些进度条", R.mipmap.ui_loading);
                SampleModel sampleModel4 = new SampleModel("选择", R.mipmap.ui_dropdown_menu);
                SampleModel sampleModel5 = new SampleModel("动画", R.mipmap.ui_loading);
                SampleModel sampleModel6 = new SampleModel("其他效果", R.mipmap.ui_keyboard);
                SampleModel sampleModel7 = new SampleModel("键盘", R.mipmap.ui_keyboard);

                data.add(sampleModel1);
                data.add(sampleModel2);
                data.add(sampleModel3);
                data.add(sampleModel4);
                data.add(sampleModel5);
                data.add(sampleModel6);
                data.add(sampleModel7);

                break;
        }


        return data;

    }


}
