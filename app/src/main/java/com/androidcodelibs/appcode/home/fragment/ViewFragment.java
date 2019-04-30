package com.androidcodelibs.appcode.home.fragment;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.alibaba.android.arouter.launcher.ARouter;
import com.androidcodelibs.androidutilslib.app.base.BaseFragment;
import com.androidcodelibs.androidutilslib.utils.ISImageUtils;
import com.androidcodelibs.androidutilslib.utils.LogUtils;
import com.androidcodelibs.androidutilslib.view.listener.ALOnItemClickListener;
import com.androidcodelibs.appcode.R;
import com.androidcodelibs.appcode.home.adapter.SamplesAdapter;
import com.androidcodelibs.appcode.home.model.SampleModel;
import com.androidcodelibs.listgrid.ListTestActivity;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

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
    private static final String ARG_NAV_TITLE = "navtitle";
    private static final String ARG_LIST_DATA = "datas";
    private String navTitle;
    private List<SampleModel> datas;
    private SamplesAdapter samplesAdapter;
    private Context mContext;


    public ViewFragment() {
    }

    /**
     * 采用的是静态工厂
     *
     * @return ViewFragment 实例
     */
    public static ViewFragment newInstance(String title, List<SampleModel> datas) {
        ViewFragment fragment = new ViewFragment();
        Bundle args = new Bundle();
        args.putString(ARG_NAV_TITLE, title);
        args.putSerializable(ARG_LIST_DATA, (Serializable) datas);
        fragment.setArguments(args);

        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            navTitle = getArguments().getString(ARG_NAV_TITLE);
            datas = (List<SampleModel>) getArguments().getSerializable(ARG_LIST_DATA);
        }
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        mContext = getActivity();
        if (null != mRootView) {
            ViewGroup parent = (ViewGroup) mRootView.getParent();
            if (null != parent) {
                parent.removeView(mRootView);
            }
        } else {
            mRootView = inflater.inflate(R.layout.fragment_view, container, false);
            initView(mRootView);
        }

        return mRootView;
    }

    private void initView(View mRootView) {

        mRecyclerView = mRootView.findViewById(R.id.recyclerView);
        LinearLayoutManager linearLayoutManager = new LinearLayoutManager(mContext);
        mRecyclerView.setLayoutManager(linearLayoutManager);
        if (datas == null) {
            datas = new ArrayList<>();
        }
        samplesAdapter = new SamplesAdapter(mContext, (ArrayList<SampleModel>) datas);
        mRecyclerView.setAdapter(samplesAdapter);

        samplesAdapter.setOnItemClickListener(new ALOnItemClickListener() {
            @Override
            public void onItemClick(View view, int position) {

// 2. 跳转并携带参数
                ARouter.getInstance().build("/listgrid/ListTestActivity")
                        .withLong("key1", 666L)
                        .withString("key3", "888")
                        .withSerializable("key4", new SampleModel("Jack", 11))
                        .navigation();


            }
        });


    }


    @Override
    public void onAttach(Context context) {
        super.onAttach(context);

    }

    @Override
    public void onDetach() {
        super.onDetach();


    }

    @Override
    public void setUserVisibleHint(boolean isVisibleToUser) {
        super.setUserVisibleHint(isVisibleToUser);

        if (isVisibleToUser) {

            LogUtils.i("常见布局页面可见");

        } else {

            LogUtils.i("常见布局页面不可见");
        }


    }
}
