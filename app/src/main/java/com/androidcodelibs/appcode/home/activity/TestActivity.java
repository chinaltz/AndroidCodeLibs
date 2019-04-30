package com.androidcodelibs.appcode.home.activity;

import android.os.Bundle;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;

import com.alibaba.android.arouter.facade.annotation.Autowired;
import com.alibaba.android.arouter.facade.annotation.Route;
import com.alibaba.android.arouter.launcher.ARouter;
import com.androidcodelibs.androidutilslib.utils.ToastUtils;
import com.androidcodelibs.appcode.R;
import com.androidcodelibs.appcode.home.model.SampleModel;

@Route(path = "/mian/TestActivity")
public class TestActivity extends AppCompatActivity {

    @Autowired
    public long key1;
    @Autowired
    String key3;
    @Autowired
    SampleModel key4;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test);

        ARouter.getInstance().inject(this);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });


        ToastUtils.showShort(key1 + key3 + key4.getTitle());
    }

}
