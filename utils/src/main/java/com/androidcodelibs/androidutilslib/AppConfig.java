package com.androidcodelibs.androidutilslib;


/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/11 下午3:23.
 * Info 框架的设置
 */
public class AppConfig {

    /**
     * UI设计的基准宽度.
     */
    public static float UI_WIDTH = 360.0f;

    /**
     * UI设计的基准高度.
     */
    public static float UI_HEIGHT = 667.0f;

    /**
     * UI设计的密度.
     */
    public static int UI_DENSITY = 2;

    /**
     * 开发阶段
     */
    public static final int DEVELOP = 0;
    /**
     * 内部测试阶段
     */
    public static final int DEBUG = 1;
    /**
     * 公开测试
     */
    public static final int BATE = 2;
    /**
     * 正式版
     */
    public static final int RELEASE = 3;


    public static final int CURRENTDEBUGSTATE = DEBUG;

    /**
     * 全局LOG TAG
     */
    public static String Tag = "patrol_";

    /**
     * 默认 SharePreferences文件名.
     */
    public static String SHARED_PATH = "app_share";

//    /**
//     * 默认下载文件地址.
//     */
//    public static String DOWNLOAD_ROOT_DIR = "download";

    /**
     * 默认下载图片文件地址.
     */
    public static String IMAGE_DIR = "images";

    /**
     * 默认下载文件地址.
     */
    public static String FILE_DIR = "files";

    /**
     * APP缓存目录.
     */
    public static String CACHE_DIR = "cache";

    /**
     * DB目录.
     */
    public static String DB_DIR = "db";


    /**
     * DB目录.
     */
    public static String CRASH_DIR = "crash";


    /**
     * DB目录.
     */
    public static String LOG_DIR = "log";

    /**
     * 下载目录.
     */
    public static String DOWNLOAD_DIR = "download";

    /**
     * The Constant UNKNOWNHOSTEXCEPTION.
     */
    public static String UNKNOWN_HOST_EXCEPTION = "远程服务连接失败";

    /**
     * The Constant CONNECTEXCEPTION.
     */
    public static String CONNECT_EXCEPTION = "网络连接出错，请重试";

    /**
     * The Constant CONNECT  SOCKET TIMEOUTEXCEPTION.
     */
    public static String CONNECT_TIMEOUT_EXCEPTION = "连接超时，请重试";

    /**
     * The Constant CLIENTPROTOCOLEXCEPTION.
     */
    public static String CLIENT_PROTOCOL_EXCEPTION = "HTTP请求参数错误";

    /**
     * 参数个数不够.
     */
    public static String MISSING_PARAMETERS = "参数没有包含足够的值";

    /**
     * The Constant REMOTESERVICEEXCEPTION.
     */
    public static String REMOTE_SERVICE_EXCEPTION = "抱歉，远程服务出错了";

    /**
     * 资源未找到.
     */
    public static String NOT_FOUND_EXCEPTION = "请求的资源无效404";

    /**
     * 没有权限访问资源.
     */
    public static String FORBIDDEN_EXCEPTION = "没有权限访问资源";

    /**
     * 程序下载任务过多请稍后再试.
     */
    public static String THREAD_EXCEPTION = "程序下载任务过多请稍后再试";

    /**
     * 其他异常.
     */
    public static String UNTREATED_EXCEPTION = "未处理的异常";


}
