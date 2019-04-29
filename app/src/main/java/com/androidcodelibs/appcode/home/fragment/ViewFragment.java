package com.androidcodelibs.appcode.home.fragment;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.androidcodelibs.appcode.R;

/**
 * @author:litingzhe
 * @date: 2019/4/29   16:14
 * @description: 常用一些交互 /项目中曾用过的交互/网上看到不错的效果
 * @git:https://github.com/chinaltz
 * @简书地址:https://www.jianshu.com/u/3d8c73dff561
 */


public class ViewFragment extends Fragment {

    //Fragment 根View
    private View mRootView;
    //  常见View 列表
    private RecyclerView mRecyclerView;

    public ViewFragment() {
    }

    /**
     * 采用的是静态工厂
     *
     * @return ViewFragment 实例
     */
    public static ViewFragment newInstance() {
        ViewFragment fragment = new ViewFragment();

        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {

        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        if (null != mRootView) {
            ViewGroup parent = (ViewGroup) mRootView.getParent();
            if (null != parent) {
                parent.removeView(mRootView);
            }
        } else {
            mRootView = inflater.inflate(R.layout.fragment_view, null);
            initView(mRootView);
        }

        return mRootView;
    }

    private void initView(View mRootView) {


    }


    @Override
    public void onAttach(Context context) {
        super.onAttach(context);

    }

    @Override
    public void onDetach() {
        super.onDetach();

    }


}
