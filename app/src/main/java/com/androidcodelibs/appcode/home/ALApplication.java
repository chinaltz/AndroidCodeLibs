package com.androidcodelibs.appcode.home;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Environment;
import android.support.annotation.RequiresPermission;
import android.support.v4.app.ActivityCompat;

import com.alibaba.android.arouter.launcher.ARouter;
import com.androidcodelibs.androidutilslib.app.base.BaseApplication;
import com.androidcodelibs.androidutilslib.utils.AppUtils;
import com.androidcodelibs.androidutilslib.utils.CrashUtils;
import com.androidcodelibs.androidutilslib.utils.DateUtils;
import com.androidcodelibs.androidutilslib.utils.FileUtils;
import com.androidcodelibs.androidutilslib.utils.LogUtils;
import com.androidcodelibs.androidutilslib.utils.Utils;
import com.androidcodelibs.appcode.BuildConfig;

import java.io.File;

import static android.Manifest.permission.WRITE_EXTERNAL_STORAGE;

/**
 * @author:litingzhe
 * @date: 2019/4/30   13:46
 * @description:
 * @git:https://github.com/chinaltz
 * @简书地址:https://www.jianshu.com/u/3d8c73dff561
 */
public class ALApplication extends BaseApplication {


    @Override
    public void onCreate() {
        super.onCreate();


        if (BuildConfig.DEBUG) {           // 这两行必须写在init之前，否则这些配置在init过程中将无效
            ARouter.openLog();     // 打印日志
            ARouter.openDebug();   // 开启调试模式(如果在InstantRun模式下运行，必须开启调试模式！线上版本需要关闭,否则有安全风险)
        }
        ARouter.init(this); // 尽可能早，推荐在Application中初始化
//        初始化 工具类
        Utils.init(this);

//        有权限的时候 初始化APP的文件
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                == PackageManager.PERMISSION_GRANTED) {
            FileUtils.initFileDir(this);
            initCrash();
            initLog();
        }


    }

    //初始化Log 日志
    public void initLog() {
        final LogUtils.Config config = LogUtils.getConfig()
                .setLogSwitch(BuildConfig.DEBUG)// 设置 log 总开关，包括输出到控制台和文件，默认开
                .setConsoleSwitch(BuildConfig.DEBUG)// 设置是否输出到控制台开关，默认开
                .setGlobalTag(null)// 设置 log 全局标签，默认为空
                // 当全局标签不为空时，我们输出的 log 全部为该 tag，
                // 为空时，如果传入的 tag 为空那就显示类名，否则显示 tag
                .setLogHeadSwitch(true)// 设置 log 头信息开关，默认为开
                .setLog2FileSwitch(true)// 打印 log 时是否存到文件的开关，默认关
                .setDir(FileUtils.getLogDir(this))// 当自定义路径为空时，写入应用的/cache/log/目录中
                .setFilePrefix("ISLogUtils-" + DateUtils.getCurrentDate(DateUtils.dateFormatYMD))// 当文件前缀为空时，默认为"util"，即写入文件为"util-MM-dd.txt"
                .setBorderSwitch(true)// 输出日志是否带边框开关，默认开
                .setSingleTagSwitch(true)// 一条日志仅输出一条，默认开，为美化 AS 3.1 的 Logcat
                .setConsoleFilter(LogUtils.V)// log 的控制台过滤器，和 logcat 过滤器同理，默认 Verbose
                .setFileFilter(LogUtils.V)// log 文件过滤器，和 logcat 过滤器同理，默认 Verbose
                .setStackDeep(1)// log 栈深度，默认为 1
                .setStackOffset(0);// 设置栈偏移，比如二次封装的话就需要设置，默认为 0
        LogUtils.d(config.toString());
    }


    //初始化 崩溃信息
    @RequiresPermission(WRITE_EXTERNAL_STORAGE)
    private void initCrash() {


        CrashUtils.init(new File(FileUtils.getCrashDir(this)),
                new CrashUtils.OnCrashListener() {
                    @Override
                    public void onCrash(String crashInfo, Throwable e) {
                        LogUtils.e(crashInfo);
                        AppUtils.relaunchApp();
                    }
                });


    }

    @Override
    public void onTerminate() {
        super.onTerminate();

        ARouter.getInstance().destroy();
    }
}
