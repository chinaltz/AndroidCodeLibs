package com.androidcodelibs.appcode.home.activity;

import android.support.design.widget.TabLayout;
import android.support.v4.app.Fragment;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.alibaba.android.arouter.facade.annotation.Route;
import com.androidcodelibs.androidutilslib.app.base.BaseActivity;
import com.androidcodelibs.androidutilslib.view.ALViewPager;
import com.androidcodelibs.appcode.R;
import com.androidcodelibs.appcode.home.adapter.MainFragmentAdapter;
import com.androidcodelibs.appcode.home.fragment.ViewFragment;
import com.androidcodelibs.appcode.home.model.SampleListManager;

import java.util.ArrayList;

@Route(path = "/mian/MainActivity")
public class MainActivity extends BaseActivity {


    //底部Tabbar 标题 描述
    private String[] titleList = new String[]{
            "常用界面", "通用功能", "数据通信"
    };

    //    TabBar 未点击图标
    private int[] icons = new int[]{
            R.mipmap.mainpage_home_nor_ic,
            R.mipmap.mainpage_topic_nor_ic,
            R.mipmap.mainpage_category_nor_ic,
    };
    //    TabBar  点击图标
    private int[] icons_press = new int[]{
            R.mipmap.mainpage_home_pressed_ic,
            R.mipmap.mainpage_topic_pressed_ic,
            R.mipmap.mainpage_category_pressed_ic,
    };

    //     主Tab页 Fragment 列表
    private ArrayList<Fragment> fragmentList;
    private ALViewPager viewPager;
    private TabLayout tabLayout;

    private ViewFragment viewFragment;
    private ViewFragment viewFragment3;
    private ViewFragment viewFragment2;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initView();


    }

    private void initView() {

        viewPager = findViewById(R.id.view_pager);
        tabLayout = findViewById(R.id.tab_layout);

        viewPager.setOffscreenPageLimit(4);


        viewFragment = ViewFragment.newInstance(titleList[0], SampleListManager.getDatas(0));
        viewFragment2 = ViewFragment.newInstance(titleList[1], SampleListManager.getDatas(1));
        viewFragment3 = ViewFragment.newInstance(titleList[2], SampleListManager.getDatas(2));
        fragmentList = new ArrayList<>();
        fragmentList.add(viewFragment);
        fragmentList.add(viewFragment2);
        fragmentList.add(viewFragment3);


        tabLayout.setTabMode(TabLayout.MODE_FIXED);


        MainFragmentAdapter adapter = new MainFragmentAdapter(getSupportFragmentManager(), titleList, fragmentList);
        viewPager.setAdapter(adapter);
        tabLayout.setupWithViewPager(viewPager);


        //设置ViewPager 是否可以滑动
        viewPager.setPagingEnabled(true);

        viewPager.addOnPageChangeListener(new ViewPager.OnPageChangeListener() {

            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

            }

            @Override
            public void onPageSelected(int position) {


                for (int i = 0; i < titleList.length; i++) {
                    TabLayout.Tab tab = tabLayout.getTabAt(i);
                    View view = tab.getCustomView();
                    ImageView img = (ImageView) view.findViewById(R.id.tab_icon);
                    TextView title = (TextView) view.findViewById(R.id.tab_title);

                    if (position == i) {
                        img.setImageResource(icons_press[i]);
                        title.setTextColor(getResources().getColor(R.color.mainColor));
                    } else {
                        img.setImageResource(icons[i]);
                        title.setTextColor(getResources().getColor(R.color.gray_dark));
                    }
                }
            }

            @Override
            public void onPageScrollStateChanged(int state) {

            }
        });


        //为TabLayout添加tab名称
        for (int i = 0; i < titleList.length; i++) {
            TabLayout.Tab tab = tabLayout.getTabAt(i);
            tab.setCustomView(getTabView(i));
        }

        viewPager.setCurrentItem(0);


    }


    /**
     * 添加getTabView的方法，来进行自定义Tab的布局View
     *
     * @param position
     * @return
     */
    public View getTabView(int position) {
        LayoutInflater mInflater = LayoutInflater.from(this);
        View view = null;

        view = mInflater.inflate(R.layout.main_item_bottom_tab, null);
        TextView tv = (TextView) view.findViewById(R.id.tab_title);
        tv.setText(titleList[position]);
        ImageView img = (ImageView) view.findViewById(R.id.tab_icon);
        if (position == 0) {
            tv.setTextColor(getResources().getColor(R.color.mainColor));
            img.setImageResource(icons_press[position]);
        } else {
            tv.setTextColor(getResources().getColor(R.color.gray));
            img.setImageResource(icons[position]);
        }
        return view;
    }

}
