package com.androidcodelibs.listgrid;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;

import com.alibaba.android.arouter.facade.annotation.Autowired;
import com.alibaba.android.arouter.facade.annotation.Route;
import com.alibaba.android.arouter.launcher.ARouter;
import com.androidcodelibs.androidutilslib.utils.JsonUtil;
import com.androidcodelibs.androidutilslib.utils.ToastUtils;

@Route(path = "/listgrida/ListTestActivity")
public class ListTestActivity extends AppCompatActivity {
    @Autowired
    public long key1;
    @Autowired
    String key3;
    @Autowired
    Object key4;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_list_test);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        ARouter.getInstance().inject(this);
        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

        ToastUtils.showShort(key1 + key3 + JsonUtil.toJson(key4)+"lllists");
    }

}
