package com.androidcodelibs.androidutilslib.utils;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.ActivityManager.MemoryInfo;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.app.ActivityManager.RunningServiceInfo;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.pm.Signature;
import android.content.res.Resources;
import android.graphics.drawable.Drawable;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.telephony.TelephonyManager;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.Xml;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;

import com.androidcodelibs.androidutilslib.model.AppProcessInfo;
import com.androidcodelibs.androidutilslib.model.CPUInfo;
import com.androidcodelibs.androidutilslib.model.ProcessInfo;
import com.androidcodelibs.androidutilslib.model.PsRow;

import org.xmlpull.v1.XmlPullParser;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.regex.Pattern;

import static com.androidcodelibs.androidutilslib.utils.Utils.getApp;


/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/11 下午3:23.
 * Info APP工具类
 */
public class AppUtils {

    public static List<String[]> mProcessList = null;

    /**
     * SD卡读写权限请求码
     */
    public static final int EXTERNAL_STORAGE_REQ_CODE = 10;




    /**
     * 是否使屏幕常亮
     *
     * @param activity
     */
    public static void keepScreenLongLight(Activity activity,boolean isOpenLight) {
        Window window = activity.getWindow();
        if (isOpenLight) {
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }

    }
    /**
     * 打开并安装文件.
     *
     * @param context the context
     * @param file    apk文件路径
     */
    public static void installApk(Context context, File file) {
        Intent intent = new Intent();
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setDataAndType(Uri.fromFile(file),
                "application/vnd.android.package-archive");
        context.startActivity(intent);
    }

    /**
     * 卸载程序.
     *
     * @param context     the context
     * @param packageName 包名
     */
    public static void uninstallApk(Context context, String packageName) {
        Intent intent = new Intent(Intent.ACTION_DELETE);
        Uri packageURI = Uri.parse("package:" + packageName);
        intent.setData(packageURI);
        context.startActivity(intent);
    }


    /**
     * 用来判断服务是否运行.
     *
     * @param context   the context
     * @param className 判断的服务名字 "com.xxx.xx..XXXService"
     * @return true 在运行 false 不在运行
     */
    public static boolean isServiceRunning(Context context, String className) {
        boolean isRunning = false;
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        List<RunningServiceInfo> servicesList = activityManager.getRunningServices(Integer.MAX_VALUE);
        Iterator<RunningServiceInfo> l = servicesList.iterator();
        while (l.hasNext()) {
            RunningServiceInfo si = (RunningServiceInfo) l.next();
            if (className.equals(si.service.getClassName())) {
                isRunning = true;
            }
        }
        return isRunning;
    }

    /**
     * 停止服务.
     *
     * @param context   the context
     * @param className the class name
     * @return true, if successful
     */
    public static boolean stopRunningService(Context context, String className) {
        Intent intent_service = null;
        boolean ret = false;
        try {
            intent_service = new Intent(context, Class.forName(className));
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (intent_service != null) {
            ret = context.stopService(intent_service);
        }
        return ret;
    }


    /**
     * Gets the number of cores available in this device, across all processors.
     * Requires: Ability to peruse the filesystem at "/sys/devices/system/cpu"
     *
     * @return The number of cores, or 1 if failed to get result
     */
    public static int getNumCores() {
        try {
            //Get directory containing CPU info
            File dir = new File("/sys/devices/system/cpu/");
            //Filter to only list the devices we care about
            File[] files = dir.listFiles(new FileFilter() {

                @Override
                public boolean accept(File pathname) {
                    //Check if filename is "cpu", followed by a single digit number
                    if (Pattern.matches("cpu[0-9]", pathname.getName())) {
                        return true;
                    }
                    return false;
                }

            });
            //Return the number of cores (virtual CPU devices)
            return files.length;
        } catch (Exception e) {
            e.printStackTrace();
            return 1;
        }
    }


    /**
     * 判断网络是否有效.
     *
     * @param context the context
     * @return true, if is network available
     */
    public static boolean isNetworkAvailable(Context context) {
        try {
            ConnectivityManager connectivity = (ConnectivityManager) context
                    .getSystemService(Context.CONNECTIVITY_SERVICE);
            if (connectivity != null) {
                NetworkInfo info = connectivity.getActiveNetworkInfo();
                if (info != null && info.isConnected()) {
                    if (info.getState() == NetworkInfo.State.CONNECTED) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return false;
    }

    /**
     * Gps是否打开
     * 需要<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />权限
     *
     * @param context the context
     * @return true, if is gps enabled
     */
    public static boolean isGpsEnabled(Context context) {
        LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        return lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
    }


    /**
     * 判断当前网络是否是移动数据网络.
     *
     * @param context the context
     * @return boolean
     */
    public static boolean isMobile(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context
                .getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetInfo = connectivityManager.getActiveNetworkInfo();
        if (activeNetInfo != null
                && activeNetInfo.getType() == ConnectivityManager.TYPE_MOBILE) {
            return true;
        }
        return false;
    }

    /**
     * 导入数据库.
     *
     * @param context the context
     * @param dbName  the db name
     * @param rawRes  the raw res
     * @return true, if successful
     */
    public static boolean importDatabase(Context context, String dbName, int rawRes) {
        int buffer_size = 1024;
        InputStream is = null;
        FileOutputStream fos = null;
        boolean flag = false;

        try {
            String dbPath = "/data/data/" + context.getPackageName() + "/databases/" + dbName;
            File dbfile = new File(dbPath);
            //判断数据库文件是否存在，若不存在则执行导入，否则直接打开数据库
            if (!dbfile.exists()) {
                //欲导入的数据库
                if (!dbfile.getParentFile().exists()) {
                    dbfile.getParentFile().mkdirs();
                }
                dbfile.createNewFile();
                is = context.getResources().openRawResource(rawRes);
                fos = new FileOutputStream(dbfile);
                byte[] buffer = new byte[buffer_size];
                int count = 0;
                while ((count = is.read(buffer)) > 0) {
                    fos.write(buffer, 0, count);
                }
                fos.flush();
            }
            flag = true;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (fos != null) {
                try {
                    fos.close();
                } catch (Exception e) {
                }
            }
            if (is != null) {
                try {
                    is.close();
                } catch (Exception e) {
                }
            }
        }
        return flag;
    }

    /**
     * 获取屏幕尺寸与密度.
     *
     * @param context the context
     * @return mDisplayMetrics
     */
    public static DisplayMetrics getDisplayMetrics(Context context) {
        Resources mResources;
        if (context == null) {
            mResources = Resources.getSystem();

        } else {
            mResources = context.getResources();
        }
        //DisplayMetrics{density=1.5, width=480, height=854, scaledDensity=1.5, xdpi=160.421, ydpi=159.497}
        //DisplayMetrics{density=2.0, width=720, height=1280, scaledDensity=2.0, xdpi=160.42105, ydpi=160.15764}
        DisplayMetrics mDisplayMetrics = mResources.getDisplayMetrics();
        return mDisplayMetrics;
    }

    /**
     * 打开键盘.
     *
     * @param context the context
     */
    public static void showSoftInput(Context context) {
        InputMethodManager inputMethodManager = (InputMethodManager) context
                .getSystemService(Context.INPUT_METHOD_SERVICE);
        inputMethodManager.toggleSoftInput(0, InputMethodManager.HIDE_NOT_ALWAYS);
    }

    /**
     * 关闭键盘事件.
     *
     * @param context the context
     */
    public static void closeSoftInput(Context context) {
        InputMethodManager inputMethodManager = (InputMethodManager) context
                .getSystemService(Context.INPUT_METHOD_SERVICE);
        if (inputMethodManager != null && ((Activity) context).getCurrentFocus() != null) {
            inputMethodManager.hideSoftInputFromWindow(((Activity) context).getCurrentFocus()
                    .getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }

    /**
     * 获取包信息.
     *
     * @param context the context
     */
    public static PackageInfo getPackageInfo(Context context) {
        PackageInfo info = null;
        try {
            String packageName = context.getPackageName();
            info = context.getPackageManager().getPackageInfo(packageName, PackageManager.GET_ACTIVITIES);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return info;
    }


    /**
     * 获取运行的进程列表.
     *
     * @param context
     * @return
     */
    public static List<AppProcessInfo> getRunningAppProcesses(Context context) {
        ActivityManager activityManager = null;
        List<AppProcessInfo> list = null;
        PackageManager packageManager = null;
        try {
            activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
            packageManager = context.getApplicationContext().getPackageManager();
            list = new ArrayList<AppProcessInfo>();
            //所有运行的进程
            List<RunningAppProcessInfo> appProcessList = activityManager.getRunningAppProcesses();
            ApplicationInfo appInfo = null;
            AppProcessInfo abAppProcessInfo = null;
            PackageInfo packageInfo = getPackageInfo(context);

            if (mProcessList != null) {
                mProcessList.clear();
            }
            mProcessList = getProcessRunningInfo();

            for (RunningAppProcessInfo appProcessInfo : appProcessList) {
                abAppProcessInfo = new AppProcessInfo(appProcessInfo.processName, appProcessInfo.pid, appProcessInfo.uid);
                if (appInfo != null) {
                    Drawable icon = appInfo.loadIcon(packageManager);
                    String appName = appInfo.loadLabel(packageManager).toString();
                    abAppProcessInfo.icon = icon;
                    abAppProcessInfo.appName = appName;
                } else {
                    //:服务的命名
                    if (appProcessInfo.processName.indexOf(":") != -1) {
                        appInfo = getApplicationInfo(context, appProcessInfo.processName.split(":")[0]);
                        Drawable icon = appInfo.loadIcon(packageManager);
                        abAppProcessInfo.icon = icon;
                    }
                    abAppProcessInfo.appName = appProcessInfo.processName;
                }

	    		/*AbPsRow psRow = getPsRow(appProcessInfo.processName);
	    		if(psRow!=null){
	    			abAppProcessInfo.memory = psRow.mem;
	    		}*/

                ProcessInfo processInfo = getMemInfo(appProcessInfo.processName);
                abAppProcessInfo.memory = processInfo.memory;
                abAppProcessInfo.cpu = processInfo.cpu;
                abAppProcessInfo.status = processInfo.status;
                abAppProcessInfo.threadsCount = processInfo.threadsCount;
                list.add(abAppProcessInfo);
            }


        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    /**
     * 根据进程名返回应用程序.
     *
     * @param context
     * @param processName
     * @return
     */
    public static ApplicationInfo getApplicationInfo(Context context, String processName) {
        if (processName == null) {
            return null;
        }

        PackageManager packageManager = context.getApplicationContext().getPackageManager();
        List<ApplicationInfo> appList = packageManager.getInstalledApplications(PackageManager.GET_UNINSTALLED_PACKAGES);
        for (ApplicationInfo appInfo : appList) {
            if (processName.equals(appInfo.processName)) {
                return appInfo;
            }
        }
        return null;
    }

    /**
     * kill进程.
     *
     * @param context
     * @param pid
     */
    public static void killProcesses(Context context, int pid, String processName) {
    	/*String cmd = "kill -9 "+pid;
    	Process process = null;
	    DataOutputStream os = null;
    	try {
			process = Runtime.getRuntime().exec("su"); 
			os = new DataOutputStream(process.getOutputStream());
			os.writeBytes(cmd + "\n");
			os.writeBytes("exit\n");
			os.flush();
			process.waitFor();
		} catch (Exception e) {
			e.printStackTrace();
		}
    	AbLogUtil.d(AppUtils.class, "#kill -9 "+pid);*/

        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        String packageName = null;
        try {
            if (processName.indexOf(":") == -1) {
                packageName = processName;
            } else {
                packageName = processName.split(":")[0];
            }

            activityManager.killBackgroundProcesses(packageName);

            //
            Method forceStopPackage = activityManager.getClass().getDeclaredMethod("forceStopPackage", String.class);
            forceStopPackage.setAccessible(true);
            forceStopPackage.invoke(activityManager, packageName);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }


    /**
     * 执行PS.
     */
    public static List<PsRow> ps() {
        List<PsRow> psRowlist = new ArrayList<PsRow>();
        String ps = runScript("ps");
        String[] lines = ps.split("\n");
        psRowlist = new ArrayList<PsRow>();
        for (String line : lines) {
            PsRow row = new PsRow(line);
            if (row.pid != null) psRowlist.add(row);
        }
        return psRowlist;
    }

    /**
     * 获得这个进程的ps信息.
     *
     * @param processName
     * @return
     */
    public static PsRow getPsRow(String processName) {
        List<PsRow> psRowlist = ps();
        for (PsRow row : psRowlist) {
            if (processName.equals(row.cmd)) {
                return row;
            }
        }
        return null;
    }

    /**
     * 根据进程名获取CPU和内存信息.
     *
     * @param processName
     * @return
     */
    public static ProcessInfo getMemInfo(String processName) {
        ProcessInfo process = new ProcessInfo();
        if (mProcessList == null) {
            mProcessList = getProcessRunningInfo();
        }
        String processNameTemp = "";

        for (Iterator<String[]> iterator = mProcessList.iterator(); iterator.hasNext(); ) {
            String[] item = (String[]) iterator.next();
            processNameTemp = item[9];
            //AbLogUtil.d(AppUtils.class, "##"+item[9]+",NAME:"+processNameTemp);
            if (processNameTemp != null && processNameTemp.equals(processName)) {
                //AbLogUtil.d(AppUtils.class, "##"+item[9]+","+process.memory);
                //Process ID
                process.pid = Integer.parseInt(item[0]);
                //CPU
                process.cpu = item[2];
                //S
                process.status = item[3];
                //thread
                process.threadsCount = item[4];
                //Mem
                long mem = 0;
                if (item[6].indexOf("M") != -1) {
                    mem = Long.parseLong(item[6].replace("M", "")) * 1000 * 1024;
                } else if (item[6].indexOf("K") != -1) {
                    mem = Long.parseLong(item[6].replace("K", "")) * 1000;
                } else if (item[6].indexOf("G") != -1) {
                    mem = Long.parseLong(item[6].replace("G", "")) * 1000 * 1024 * 1024;
                }
                process.memory = mem;
                //UID
                process.uid = item[8];
                //Process Name
                process.processName = item[9];
                break;
            }
        }
        if (process.memory == 0) {
            LogUtils.i(AppUtils.class, "##" + processName + ",top -n 1未找到");
        }
        return process;
    }

    /**
     * 根据进程ID获取CPU和内存信息.
     *
     * @param pid
     * @return
     */
    public static ProcessInfo getMemInfo(int pid) {
        ProcessInfo process = new ProcessInfo();
        if (mProcessList == null) {
            mProcessList = getProcessRunningInfo();
        }
        String tempPidString = "";
        int tempPid = 0;
        int count = mProcessList.size();
        for (int i = 0; i < count; i++) {
            String[] item = mProcessList.get(i);
            tempPidString = item[0];
            if (tempPidString == null) {
                continue;
            }
            //AbLogUtil.d(AppUtils.class, "##"+item[9]+",PID:"+tempPid);
            tempPid = Integer.parseInt(tempPidString);
            if (tempPid == pid) {
                //AbLogUtil.d(AppUtils.class, "##"+item[9]+","+process.memory);
                //Process ID
                process.pid = Integer.parseInt(item[0]);
                //CPU
                process.cpu = item[2];
                //S
                process.status = item[3];
                //thread
                process.threadsCount = item[4];
                //Mem
                long mem = 0;
                if (item[6].indexOf("M") != -1) {
                    mem = Long.parseLong(item[6].replace("M", "")) * 1000 * 1024;
                } else if (item[6].indexOf("K") != -1) {
                    mem = Long.parseLong(item[6].replace("K", "")) * 1000;
                } else if (item[6].indexOf("G") != -1) {
                    mem = Long.parseLong(item[6].replace("G", "")) * 1000 * 1024 * 1024;
                }
                process.memory = mem;
                //UID
                process.uid = item[8];
                //Process Name
                process.processName = item[9];
                break;
            }
        }
        return process;
    }

    /**
     * 执行命令.
     *
     * @param command
     * @param workdirectory
     * @return
     */
    public static String runCommand(String[] command, String workdirectory) {
        String result = "";
        LogUtils.i(AppUtils.class, "#" + command);
        try {
            ProcessBuilder builder = new ProcessBuilder(command);
            // set working directory
            if (workdirectory != null) {
                builder.directory(new File(workdirectory));
            }
            builder.redirectErrorStream(true);
            Process process = builder.start();
            InputStream in = process.getInputStream();
            byte[] buffer = new byte[1024];
            while (in.read(buffer) != -1) {
                String str = new String(buffer);
                result = result + str;
            }
            in.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 运行脚本.
     *
     * @param script
     * @return
     */
    public static String runScript(String script) {
        String sRet = "";
        try {
            final Process m_process = Runtime.getRuntime().exec(script);
            final StringBuilder sbread = new StringBuilder();
            Thread tout = new Thread(new Runnable() {
                public void run() {
                    BufferedReader bufferedReader = new BufferedReader(
                            new InputStreamReader(m_process.getInputStream()),
                            8192);
                    String ls_1 = null;
                    try {
                        while ((ls_1 = bufferedReader.readLine()) != null) {
                            sbread.append(ls_1).append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        try {
                            bufferedReader.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            });
            tout.start();

            final StringBuilder sberr = new StringBuilder();
            Thread terr = new Thread(new Runnable() {
                public void run() {
                    BufferedReader bufferedReader = new BufferedReader(
                            new InputStreamReader(m_process.getErrorStream()),
                            8192);
                    String ls_1 = null;
                    try {
                        while ((ls_1 = bufferedReader.readLine()) != null) {
                            sberr.append(ls_1).append("\n");
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        try {
                            bufferedReader.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            });
            terr.start();

            int retvalue = m_process.waitFor();
            while (tout.isAlive()) {
                Thread.sleep(50);
            }
            if (terr.isAlive())
                terr.interrupt();
            String stdout = sbread.toString();
            String stderr = sberr.toString();
            sRet = stdout + stderr;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return sRet;
    }

    /**
     * 应用程序运行命令获取 Root权限，设备必须已破解(获得ROOT权限)
     *
     * @return 应用程序是/否获取Root权限
     */
    public static boolean getRootPermission(Context context) {
        String path = context.getPackageCodePath();
        return getRootPermission(path);
    }

    /**
     * 修改文件权限
     *
     * @return 文件路径
     */
    public static boolean getRootPermission(String path) {
        Process process = null;
        DataOutputStream os = null;
        try {
            File file = new File(path);
            if (!file.exists()) {
                return false;
            }
            String cmd = "chmod 777 " + path;
            // 切换到root帐号
            process = Runtime.getRuntime().exec("su");
            os = new DataOutputStream(process.getOutputStream());
            os.writeBytes(cmd + "\n");
            os.writeBytes("exit\n");
            os.flush();
            process.waitFor();
        } catch (Exception e) {
            return false;
        } finally {
            try {
                if (os != null) {
                    os.close();
                }
                process.destroy();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return true;
    }

    /**
     * 获取进程运行的信息.
     *
     * @return
     */
    public static List<String[]> getProcessRunningInfo() {
        List<String[]> processList = null;
        try {
            String result = runCommandTopN1();
            processList = parseProcessRunningInfo(result);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return processList;
    }

    /**
     * top -n 1.
     *
     * @return
     */
    public static String runCommandTopN1() {
        String result = null;
        try {
            String[] args = {"/system/bin/top", "-n", "1"};
            result = runCommand(args, "/system/bin/");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 获取进程运行的信息.
     *
     * @return
     */
    public static CPUInfo getCPUInfo() {
        CPUInfo CPUInfo = null;
        try {
            String result = runCommandTopN1();
            CPUInfo = parseCPUInfo(result);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return CPUInfo;
    }

    /**
     * 解析数据.
     *
     * @param info User 39%, System 17%, IOW 3%, IRQ 0%
     *             PID    PR CPU% S   #THR     VSS     RSS    PCY    UID        Name
     *             31587  0  39%  S    14    542288K  42272K  fg   u0_a162  cn.amsoft.process
     *             313    1  17%  S    12    68620K   11328K  fg   system   /system/bin/surfaceflinger
     *             32076  1   2%  R     1    1304K    604K    bg   u0_a162  /system/bin/top
     * @return
     */
    public static List<String[]> parseProcessRunningInfo(String info) {
        List<String[]> processList = new ArrayList<String[]>();
        int Length_ProcStat = 10;
        String tempString = "";
        boolean bIsProcInfo = false;
        String[] rows = null;
        String[] columns = null;
        rows = info.split("[\n]+");
        // 使用正则表达式分割字符串
        for (int i = 0; i < rows.length; i++) {
            tempString = rows[i];
            //AbLogUtil.d(AppUtils.class, tempString);
            if (tempString.indexOf("PID") == -1) {
                if (bIsProcInfo == true) {
                    tempString = tempString.trim();
                    columns = tempString.split("[ ]+");
                    if (columns.length == Length_ProcStat) {
                        //把/system/bin/的去掉
                        if (columns[9].startsWith("/system/bin/")) {
                            continue;
                        }
                        //AbLogUtil.d(AppUtils.class, "#"+columns[9]+",PID:"+columns[0]);
                        processList.add(columns);
                    }
                }
            } else {
                bIsProcInfo = true;
            }
        }
        return processList;
    }

    /**
     * 解析数据.
     *
     * @param info User 39%, System 17%, IOW 3%, IRQ 0%
     * @return
     */
    public static CPUInfo parseCPUInfo(String info) {
        CPUInfo CPUInfo = new CPUInfo();
        String tempString = "";
        String[] rows = null;
        String[] columns = null;
        rows = info.split("[\n]+");
        // 使用正则表达式分割字符串
        for (int i = 0; i < rows.length; i++) {
            tempString = rows[i];
            //AbLogUtil.d(AppUtils.class, tempString);
            if (tempString.indexOf("User") != -1 && tempString.indexOf("System") != -1) {
                tempString = tempString.trim();
                columns = tempString.split(",");
                for (int j = 0; j < columns.length; j++) {
                    String col = columns[j].trim();
                    String[] cpu = col.split(" ");
                    if (j == 0) {
                        CPUInfo.User = cpu[1];
                    } else if (j == 1) {
                        CPUInfo.System = cpu[1];
                    } else if (j == 2) {
                        CPUInfo.IOW = cpu[1];
                    } else if (j == 3) {
                        CPUInfo.IRQ = cpu[1];
                    }
                }
            }
        }
        return CPUInfo;
    }

    /**
     * 获取可用内存.
     *
     * @param context
     * @return
     */
    public static long getAvailMemory(Context context) {
        //获取android当前可用内存大小
        ActivityManager activityManager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        MemoryInfo memoryInfo = new MemoryInfo();
        activityManager.getMemoryInfo(memoryInfo);
        //当前系统可用内存 ,将获得的内存大小规格化
        return memoryInfo.availMem;
    }

    /**
     * 总内存.
     *
     * @param context
     * @return
     */
    public static long getTotalMemory(Context context) {
        //系统内存信息文件
        String file = "/proc/meminfo";
        String memInfo;
        String[] strs;
        long memory = 0;

        try {
            FileReader fileReader = new FileReader(file);
            BufferedReader bufferedReader = new BufferedReader(fileReader, 8192);
            //读取meminfo第一行，系统内存大小
            memInfo = bufferedReader.readLine();
            strs = memInfo.split("\\s+");
            for (String str : strs) {
                LogUtils.i(AppUtils.class, str + "\t");


            }
            //获得系统总内存，单位KB
            memory = Integer.valueOf(strs[1]).intValue() * 1024;
            bufferedReader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        //Byte转位KB或MB
        return memory;
    }

    /**
     * 获取mac地址.
     *
     * @param context
     * @return
     */
    public static String getMac(Context context) {
        WifiManager wifi = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        WifiInfo info = wifi.getConnectionInfo();
        if (info.getMacAddress() == null) {
            return null;
        } else {
            return info.getMacAddress();
        }
    }

    /**
     * 获取SSID地址.
     *
     * @param context
     * @return
     */
    public static String getSSID(Context context) {

        WifiManager wifi = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
        WifiInfo info = wifi.getConnectionInfo();
        if (info.getSSID() == null) {
            return null;
        } else {
            return info.getSSID();
        }
    }

    /**
     * 获取IMSI.
     *
     * @return
     */

    public static String getIMSI(Context context) {
        TelephonyManager telephonyManager = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
        if (telephonyManager.getSubscriberId() == null) {
            return null;
        } else {
            return telephonyManager.getSubscriberId();
        }
    }

    /**
     * 获取IMEI.
     *
     * @return
     */
    public static String getIMEI(Context context) {
        TelephonyManager telephonyManager = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
        if (telephonyManager.getDeviceId() == null) {
            return null;
        } else {
            return telephonyManager.getDeviceId();
        }
    }

    /**
     * 手机号码
     *
     * @return
     */
    public static String getPhoneNumber(Context context) {
        TelephonyManager telephonyManager = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
        if (telephonyManager.getLine1Number() == null || telephonyManager.getLine1Number().length() < 11) {
            return null;
        } else {
            return telephonyManager.getLine1Number();
        }
    }

    /**
     * 获取QQ号.
     *
     * @return
     */
    public static String getQQNumber(Context context) {
        String path = "/data/data/com.tencent.mobileqq/shared_prefs/Last_Login.xml";
        getRootPermission(context);
        File file = new File(path);
        getRootPermission(path);
        boolean flag = file.canRead();
        String qq = null;
        if (flag) {
            try {
                FileInputStream is = new FileInputStream(file);
                XmlPullParser parser = Xml.newPullParser();
                parser.setInput(is, "UTF-8");
                int event = parser.getEventType();
                while (event != XmlPullParser.END_DOCUMENT) {

                    switch (event) {
                        case XmlPullParser.START_DOCUMENT:
                            break;
                        case XmlPullParser.START_TAG:
                            if ("map".equals(parser.getName())) {
                            }
                            if ("string".equals(parser.getName())) {
                                String uin = parser.getAttributeValue(null, "name");
                                if (uin.equals("uin")) {
                                    qq = parser.nextText();
                                    return qq;
                                }
                            }
                            break;
                        case XmlPullParser.END_TAG:
                            break;
                    }
                    event = parser.next();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 获取WEIXIN号.
     *
     * @return
     */
    public static String getWeiXinNumber(Context context) {
        String path = "/data/data/com.tencent.mm/shared_prefs/com.tencent.mm_preferences.xml";
        getRootPermission(context);
        File file = new File(path);
        getRootPermission(path);
        boolean flag = file.canRead();
        String weixin = null;
        if (flag) {
            try {
                FileInputStream is = new FileInputStream(file);
                XmlPullParser parser = Xml.newPullParser();
                parser.setInput(is, "UTF-8");
                int event = parser.getEventType();
                while (event != XmlPullParser.END_DOCUMENT) {

                    switch (event) {
                        case XmlPullParser.START_DOCUMENT:
                            break;
                        case XmlPullParser.START_TAG:
                            if ("map".equals(parser.getName())) {
                            }
                            if ("string".equals(parser.getName())) {
                                String nameString = parser.getAttributeValue(null, "name");
                                if (nameString.equals("login_user_name")) {
                                    weixin = parser.nextText();
                                    return weixin;
                                }
                            }
                            break;
                        case XmlPullParser.END_TAG:
                            break;
                    }
                    event = parser.next();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 调用拨打电话页面
     *
     * @param tel
     */
    public static void showActionCall(Context context, String tel) {
        Intent intent = new Intent(Intent.ACTION_CALL);
        intent.setData(Uri.parse("tel:" + tel));
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            context.startActivity(intent);
            return;
        }

    }

    /**
     * 获取SD卡访问权限，在6.0才需要程序内获取
     *
     * @param context
     * @return
     * @Override public void onRequestPermissionsResult(int requestCode,String permissions[], int[] grantResults) {
     * switch (requestCode) {
     * case EXTERNAL_STORAGE_REQ_CODE: {
     * // 如果请求被拒绝，那么通常grantResults数组为空
     * if (grantResults.length > 0
     * && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
     * //申请成功，进行相应操作
     * //.....
     * } else {
     * //申请失败，可以继续向用户解释。
     * }
     * return;
     * }
     * }
     * }
     */
    public static boolean requestSDCardPermission(Context context) {
        //判断当前Activity是否已经获得了该权限
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            //如果App的权限申请曾经被用户拒绝过，就需要在这里跟用户做出解释
            if (ActivityCompat.shouldShowRequestPermissionRationale((Activity) context,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE)) {


                ToastUtils.showShort("SDCard访问权限被拒绝，请在设置-应用程序打开! ");
                return false;
            } else {
                //进行权限请求
                ActivityCompat.requestPermissions((Activity) context,
                        new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                        EXTERNAL_STORAGE_REQ_CODE);
                return false;
            }
        } else {
            return true;
        }
    }

    /**
     * 获取系统版本
     *
     * @return
     */
    public static int getSDKVersion() {
        int sdkVersion;
        try {
            sdkVersion = Integer.valueOf(android.os.Build.VERSION.SDK);
        } catch (NumberFormatException e) {
            sdkVersion = 0;
        }
        return sdkVersion;
    }

    /**
     * 清除所有缓存
     *
     * @param context
     */
    public static void clearAllCache(Context context) {
        try {
            PackageInfo info = AppUtils.getPackageInfo(context);
            File cacheDir = null;
            if (!FileUtils.isCanUseSD()) {
                cacheDir = new File(context.getCacheDir(), info.packageName);
            } else {
                cacheDir = new File(FileUtils.getCrashDir(context));
            }
            File[] files = cacheDir.listFiles();
            if (files != null) {
                for (File file : files) {
                    file.delete();
                }
            }
//			AbLogUtil.d(AbDiskCacheImpl.class,"清除缓存成功.");
        } catch (Exception e) {
            e.printStackTrace();
//			AbLogUtil.d(AbDiskCacheImpl.class,"清除缓存失败.");
        }

    }

    /**
     * 清除所有 创建的文件
     *
     * @param context
     */
    public static void clearMyRoot(Context context) {
        try {
            PackageInfo info = AppUtils.getPackageInfo(context);
            File downloadDir = null;
            if (!FileUtils.isCanUseSD()) {
                downloadDir = new File(context.getCacheDir(), info.packageName);
            } else {
                downloadDir = new File(FileUtils.getMyRootDir(context));
            }
            File[] files = downloadDir.listFiles();
            if (files != null) {
                for (File file : files) {
                    file.delete();
                }
            }
//			AbLogUtil.d(AbDiskCacheImpl.class,"清除缓存成功.");
        } catch (Exception e) {
            e.printStackTrace();
//			AbLogUtil.d(AbDiskCacheImpl.class,"清除缓存失败.");
        }

    }


    /**
     * Relaunch the application.
     */
    public static void relaunchApp() {
        PackageManager packageManager = getApp().getPackageManager();
        Intent intent = packageManager.getLaunchIntentForPackage(getApp().getPackageName());
        if (intent == null) return;
        ComponentName componentName = intent.getComponent();
        Intent mainIntent = Intent.makeRestartActivityTask(componentName);
        getApp().startActivity(mainIntent);
        System.exit(0);
    }


    /**
     * Return whether the app is installed.
     *
     * @param action   The Intent action, such as ACTION_VIEW.
     * @param category The desired category.
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppInstalled(@NonNull final String action,
                                         @NonNull final String category) {
        Intent intent = new Intent(action);
        intent.addCategory(category);
        PackageManager pm = getApp().getPackageManager();
        ResolveInfo info = pm.resolveActivity(intent, 0);
        return info != null;
    }


    private AppUtils() {
        throw new UnsupportedOperationException("u can't instantiate me...");
    }

    /**
     * Register the status of application changed listener.
     *
     * @param obj      The object.
     * @param listener The status of application changed listener
     */
    public static void registerAppStatusChangedListener(@NonNull final Object obj,
                                                        @NonNull final Utils.OnAppStatusChangedListener listener) {
        Utils.getActivityLifecycle().addListener(obj, listener);
    }

    /**
     * Unregister the status of application changed listener.
     *
     * @param obj The object.
     */
    public static void unregisterAppStatusChangedListener(@NonNull final Object obj) {
        Utils.getActivityLifecycle().removeListener(obj);
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param filePath The path of file.
     */
    public static void installApp(final String filePath) {
        installApp(getFileByPath(filePath));
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param file The file.
     */
    public static void installApp(final File file) {
        if (!isFileExists(file)) return;
        getApp().startActivity(IntentUtils.getInstallAppIntent(file, true));
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param filePath  The path of file.
     * @param authority Target APIs greater than 23 must hold the authority of a FileProvider
     *                  defined in a {@code <provider>} element in your app's manifest.
     */
    @Deprecated
    public static void installApp(final String filePath, final String authority) {
        installApp(getFileByPath(filePath), authority);
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param file      The file.
     * @param authority Target APIs greater than 23 must hold the authority of a FileProvider
     *                  defined in a {@code <provider>} element in your app's manifest.
     */
    @Deprecated
    public static void installApp(final File file, final String authority) {
        if (!isFileExists(file)) return;
        getApp().startActivity(IntentUtils.getInstallAppIntent(file, authority, true));
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param activity    The activity.
     * @param filePath    The path of file.
     * @param requestCode If &gt;= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     */
    public static void installApp(final Activity activity,
                                  final String filePath,
                                  final int requestCode) {
        installApp(activity, getFileByPath(filePath), requestCode);
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param activity    The activity.
     * @param file        The file.
     * @param requestCode If &gt;= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     */
    public static void installApp(final Activity activity,
                                  final File file,
                                  final int requestCode) {
        if (!isFileExists(file)) return;
        activity.startActivityForResult(IntentUtils.getInstallAppIntent(file), requestCode);
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param activity    The activity.
     * @param filePath    The path of file.
     * @param authority   Target APIs greater than 23 must hold the authority of a FileProvider
     *                    defined in a {@code <provider>} element in your app's manifest.
     * @param requestCode If &gt;= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     */
    @Deprecated
    public static void installApp(final Activity activity,
                                  final String filePath,
                                  final String authority,
                                  final int requestCode) {
        installApp(activity, getFileByPath(filePath), authority, requestCode);
    }

    /**
     * Install the app.
     * <p>Target APIs greater than 25 must hold
     * {@code <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />}</p>
     *
     * @param activity    The activity.
     * @param file        The file.
     * @param authority   Target APIs greater than 23 must hold the authority of a FileProvider
     *                    defined in a {@code <provider>} element in your app's manifest.
     * @param requestCode If &gt;= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     */
    @Deprecated
    public static void installApp(final Activity activity,
                                  final File file,
                                  final String authority,
                                  final int requestCode) {
        if (!isFileExists(file)) return;
        activity.startActivityForResult(IntentUtils.getInstallAppIntent(file, authority),
                requestCode);
    }

    /**
     * Install the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.INSTALL_PACKAGES" />}</p>
     *
     * @param filePath The path of file.
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean installAppSilent(final String filePath) {
        return installAppSilent(getFileByPath(filePath), null);
    }

    /**
     * Install the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.INSTALL_PACKAGES" />}</p>
     *
     * @param file The file.
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean installAppSilent(final File file) {
        return installAppSilent(file, null);
    }


    /**
     * Install the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.INSTALL_PACKAGES" />}</p>
     *
     * @param filePath The path of file.
     * @param params   The params of installation(e.g.,<code>-r</code>, <code>-s</code>).
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean installAppSilent(final String filePath, final String params) {
        return installAppSilent(getFileByPath(filePath), params);
    }

    /**
     * Install the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.INSTALL_PACKAGES" />}</p>
     *
     * @param file   The file.
     * @param params The params of installation(e.g.,<code>-r</code>, <code>-s</code>).
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean installAppSilent(final File file, final String params) {
        return installAppSilent(file, params, isDeviceRooted());
    }

    /**
     * Install the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.INSTALL_PACKAGES" />}</p>
     *
     * @param file     The file.
     * @param params   The params of installation(e.g.,<code>-r</code>, <code>-s</code>).
     * @param isRooted True to use root, false otherwise.
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean installAppSilent(final File file,
                                           final String params,
                                           final boolean isRooted) {
        if (!isFileExists(file)) return false;
        String filePath = '"' + file.getAbsolutePath() + '"';
        String command = "LD_LIBRARY_PATH=/vendor/lib*:/system/lib* pm install " +
                (params == null ? "" : params + " ")
                + filePath;
        ShellUtils.CommandResult commandResult = ShellUtils.execCmd(command, isRooted);
        if (commandResult.successMsg != null
                && commandResult.successMsg.toLowerCase().contains("success")) {
            return true;
        } else {
            Log.e("AppUtils", "installAppSilent successMsg: " + commandResult.successMsg +
                    ", errorMsg: " + commandResult.errorMsg);
            return false;
        }
    }

    /**
     * Uninstall the app.
     *
     * @param packageName The name of the package.
     */
    public static void uninstallApp(final String packageName) {
        if (isSpace(packageName)) return;
        getApp().startActivity(IntentUtils.getUninstallAppIntent(packageName, true));
    }

    /**
     * Uninstall the app.
     *
     * @param activity    The activity.
     * @param packageName The name of the package.
     * @param requestCode If &gt;= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     */
    public static void uninstallApp(final Activity activity,
                                    final String packageName,
                                    final int requestCode) {
        if (isSpace(packageName)) return;
        activity.startActivityForResult(
                IntentUtils.getUninstallAppIntent(packageName),
                requestCode
        );
    }

    /**
     * Uninstall the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.DELETE_PACKAGES" />}</p>
     *
     * @param packageName The name of the package.
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean uninstallAppSilent(final String packageName) {
        return uninstallAppSilent(packageName, false);
    }

    /**
     * Uninstall the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.DELETE_PACKAGES" />}</p>
     *
     * @param packageName The name of the package.
     * @param isKeepData  Is keep the data.
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean uninstallAppSilent(final String packageName, final boolean isKeepData) {
        return uninstallAppSilent(packageName, isKeepData, isDeviceRooted());
    }

    /**
     * Uninstall the app silently.
     * <p>Without root permission must hold
     * {@code <uses-permission android:name="android.permission.DELETE_PACKAGES" />}</p>
     *
     * @param packageName The name of the package.
     * @param isKeepData  Is keep the data.
     * @param isRooted    True to use root, false otherwise.
     * @return {@code true}: success<br>{@code false}: fail
     */
    public static boolean uninstallAppSilent(final String packageName,
                                             final boolean isKeepData,
                                             final boolean isRooted) {
        if (isSpace(packageName)) return false;
        String command = "LD_LIBRARY_PATH=/vendor/lib*:/system/lib* pm uninstall "
                + (isKeepData ? "-k " : "")
                + packageName;
        ShellUtils.CommandResult commandResult = ShellUtils.execCmd(command, isRooted);
        if (commandResult.successMsg != null
                && commandResult.successMsg.toLowerCase().contains("success")) {
            return true;
        } else {
            Log.e("AppUtils", "uninstallAppSilent successMsg: " + commandResult.successMsg +
                    ", errorMsg: " + commandResult.errorMsg);
            return false;
        }
    }

    /**
     * Return whether the app is installed.
     *
     * @param packageName The name of the package.
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppInstalled(@NonNull final String packageName) {
        return !isSpace(packageName) && IntentUtils.getLaunchAppIntent(packageName) != null;
    }

    /**
     * Return whether the application with root permission.
     *
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppRoot() {
        ShellUtils.CommandResult result = ShellUtils.execCmd("echo root", true);
        if (result.result == 0) return true;
        if (result.errorMsg != null) {
            Log.d("AppUtils", "isAppRoot() called" + result.errorMsg);
        }
        return false;
    }

    /**
     * Return whether it is a debug application.
     *
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppDebug() {
        return isAppDebug(getApp().getPackageName());
    }

    /**
     * Return whether it is a debug application.
     *
     * @param packageName The name of the package.
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppDebug(final String packageName) {
        if (isSpace(packageName)) return false;
        try {
            PackageManager pm = getApp().getPackageManager();
            ApplicationInfo ai = pm.getApplicationInfo(packageName, 0);
            return ai != null && (ai.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Return whether it is a system application.
     *
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppSystem() {
        return isAppSystem(getApp().getPackageName());
    }

    /**
     * Return whether it is a system application.
     *
     * @param packageName The name of the package.
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppSystem(final String packageName) {
        if (isSpace(packageName)) return false;
        try {
            PackageManager pm = getApp().getPackageManager();
            ApplicationInfo ai = pm.getApplicationInfo(packageName, 0);
            return ai != null && (ai.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Return whether application is foreground.
     *
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppForeground() {
        return Utils.isAppForeground();
    }

    /**
     * Return whether application is foreground.
     * <p>Target APIs greater than 21 must hold
     * {@code <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />}</p>
     *
     * @param packageName The name of the package.
     * @return {@code true}: yes<br>{@code false}: no
     */
    public static boolean isAppForeground(@NonNull final String packageName) {
        return !isSpace(packageName) && packageName.equals(ProcessUtils.getForegroundProcessName());
    }

    /**
     * Launch the application.
     *
     * @param packageName The name of the package.
     */
    public static void launchApp(final String packageName) {
        if (isSpace(packageName)) return;
        getApp().startActivity(IntentUtils.getLaunchAppIntent(packageName, true));
    }

    /**
     * Launch the application.
     *
     * @param activity    The activity.
     * @param packageName The name of the package.
     * @param requestCode If &gt;= 0, this code will be returned in
     *                    onActivityResult() when the activity exits.
     */
    public static void launchApp(final Activity activity,
                                 final String packageName,
                                 final int requestCode) {
        if (isSpace(packageName)) return;
        activity.startActivityForResult(IntentUtils.getLaunchAppIntent(packageName), requestCode);
    }


    /**
     * Launch the application's details settings.
     */
    public static void launchAppDetailsSettings() {
        launchAppDetailsSettings(getApp().getPackageName());
    }

    /**
     * Launch the application's details settings.
     *
     * @param packageName The name of the package.
     */
    public static void launchAppDetailsSettings(final String packageName) {
        if (isSpace(packageName)) return;
        getApp().startActivity(
                IntentUtils.getLaunchAppDetailsSettingsIntent(packageName, true)
        );
    }

    /**
     * Exit the application.
     */
    public static void exitApp() {
        List<Activity> activityList = Utils.getActivityList();
        for (int i = activityList.size() - 1; i >= 0; --i) {// remove from top
            Activity activity = activityList.get(i);
            // sActivityList remove the index activity at onActivityDestroyed
            activity.finish();
        }
        System.exit(0);
    }

    /**
     * Return the application's icon.
     *
     * @return the application's icon
     */
    public static Drawable getAppIcon() {
        return getAppIcon(getApp().getPackageName());
    }

    /**
     * Return the application's icon.
     *
     * @param packageName The name of the package.
     * @return the application's icon
     */
    public static Drawable getAppIcon(final String packageName) {
        if (isSpace(packageName)) return null;
        try {
            PackageManager pm = getApp().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(packageName, 0);
            return pi == null ? null : pi.applicationInfo.loadIcon(pm);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Return the application's package name.
     *
     * @return the application's package name
     */
    public static String getAppPackageName() {
        return getApp().getPackageName();
    }

    /**
     * Return the application's name.
     *
     * @return the application's name
     */
    public static String getAppName() {
        return getAppName(getApp().getPackageName());
    }

    /**
     * Return the application's name.
     *
     * @param packageName The name of the package.
     * @return the application's name
     */
    public static String getAppName(final String packageName) {
        if (isSpace(packageName)) return "";
        try {
            PackageManager pm = getApp().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(packageName, 0);
            return pi == null ? null : pi.applicationInfo.loadLabel(pm).toString();
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return "";
        }
    }

    /**
     * Return the application's path.
     *
     * @return the application's path
     */
    public static String getAppPath() {
        return getAppPath(getApp().getPackageName());
    }

    /**
     * Return the application's path.
     *
     * @param packageName The name of the package.
     * @return the application's path
     */
    public static String getAppPath(final String packageName) {
        if (isSpace(packageName)) return "";
        try {
            PackageManager pm = getApp().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(packageName, 0);
            return pi == null ? null : pi.applicationInfo.sourceDir;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return "";
        }
    }

    /**
     * Return the application's version name.
     *
     * @return the application's version name
     */
    public static String getAppVersionName() {
        return getAppVersionName(getApp().getPackageName());
    }

    /**
     * Return the application's version name.
     *
     * @param packageName The name of the package.
     * @return the application's version name
     */
    public static String getAppVersionName(final String packageName) {
        if (isSpace(packageName)) return "";
        try {
            PackageManager pm = getApp().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(packageName, 0);
            return pi == null ? null : pi.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return "";
        }
    }

    /**
     * Return the application's version code.
     *
     * @return the application's version code
     */
    public static int getAppVersionCode() {
        return getAppVersionCode(getApp().getPackageName());
    }

    /**
     * Return the application's version code.
     *
     * @param packageName The name of the package.
     * @return the application's version code
     */
    public static int getAppVersionCode(final String packageName) {
        if (isSpace(packageName)) return -1;
        try {
            PackageManager pm = getApp().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(packageName, 0);
            return pi == null ? -1 : pi.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return -1;
        }
    }

    /**
     * Return the application's signature.
     *
     * @return the application's signature
     */
    public static Signature[] getAppSignature() {
        return getAppSignature(getApp().getPackageName());
    }

    /**
     * Return the application's signature.
     *
     * @param packageName The name of the package.
     * @return the application's signature
     */
    public static Signature[] getAppSignature(final String packageName) {
        if (isSpace(packageName)) return null;
        try {
            PackageManager pm = getApp().getPackageManager();
            @SuppressLint("PackageManagerGetSignatures")
            PackageInfo pi = pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES);
            return pi == null ? null : pi.signatures;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Return the application's signature for SHA1 value.
     *
     * @return the application's signature for SHA1 value
     */
    public static String getAppSignatureSHA1() {
        return getAppSignatureSHA1(getApp().getPackageName());
    }

    /**
     * Return the application's signature for SHA1 value.
     *
     * @param packageName The name of the package.
     * @return the application's signature for SHA1 value
     */
    public static String getAppSignatureSHA1(final String packageName) {
        if (isSpace(packageName)) return "";
        Signature[] signature = getAppSignature(packageName);
        if (signature == null || signature.length <= 0) return "";
        return encryptSHA1ToString(signature[0].toByteArray()).
                replaceAll("(?<=[0-9A-F]{2})[0-9A-F]{2}", ":$0");
    }

    /**
     * Return the application's information.
     * <ul>
     * <li>name of package</li>
     * <li>icon</li>
     * <li>name</li>
     * <li>path of package</li>
     * <li>version name</li>
     * <li>version code</li>
     * <li>is system</li>
     * </ul>
     *
     * @return the application's information
     */
    public static AppInfo getAppInfo() {
        return getAppInfo(getApp().getPackageName());
    }

    /**
     * Return the application's information.
     * <ul>
     * <li>name of package</li>
     * <li>icon</li>
     * <li>name</li>
     * <li>path of package</li>
     * <li>version name</li>
     * <li>version code</li>
     * <li>is system</li>
     * </ul>
     *
     * @param packageName The name of the package.
     * @return 当前应用的 AppInfo
     */
    public static AppInfo getAppInfo(final String packageName) {
        try {
            PackageManager pm = getApp().getPackageManager();
            PackageInfo pi = pm.getPackageInfo(packageName, 0);
            return getBean(pm, pi);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Return the applications' information.
     *
     * @return the applications' information
     */
    public static List<AppInfo> getAppsInfo() {
        List<AppInfo> list = new ArrayList<>();
        PackageManager pm = getApp().getPackageManager();
        List<PackageInfo> installedPackages = pm.getInstalledPackages(0);
        for (PackageInfo pi : installedPackages) {
            AppInfo ai = getBean(pm, pi);
            if (ai == null) continue;
            list.add(ai);
        }
        return list;
    }

    private static AppInfo getBean(final PackageManager pm, final PackageInfo pi) {
        if (pm == null || pi == null) return null;
        ApplicationInfo ai = pi.applicationInfo;
        String packageName = pi.packageName;
        String name = ai.loadLabel(pm).toString();
        Drawable icon = ai.loadIcon(pm);
        String packagePath = ai.sourceDir;
        String versionName = pi.versionName;
        int versionCode = pi.versionCode;
        boolean isSystem = (ApplicationInfo.FLAG_SYSTEM & ai.flags) != 0;
        return new AppInfo(packageName, name, icon, packagePath, versionName, versionCode, isSystem);
    }

    private static boolean isFileExists(final File file) {
        return file != null && file.exists();
    }

    private static File getFileByPath(final String filePath) {
        return isSpace(filePath) ? null : new File(filePath);
    }

    private static boolean isSpace(final String s) {
        if (s == null) return true;
        for (int i = 0, len = s.length(); i < len; ++i) {
            if (!Character.isWhitespace(s.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private static boolean isDeviceRooted() {
        String su = "su";
        String[] locations = {"/system/bin/", "/system/xbin/", "/sbin/", "/system/sd/xbin/",
                "/system/bin/failsafe/", "/data/local/xbin/", "/data/local/bin/", "/data/local/"};
        for (String location : locations) {
            if (new File(location + su).exists()) {
                return true;
            }
        }
        return false;
    }

    private static final char HEX_DIGITS[] =
            {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};

    private static String encryptSHA1ToString(final byte[] data) {
        return bytes2HexString(encryptSHA1(data));
    }

    private static byte[] encryptSHA1(final byte[] data) {
        if (data == null || data.length <= 0) return null;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA1");
            md.update(data);
            return md.digest();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String bytes2HexString(final byte[] bytes) {
        if (bytes == null) return "";
        int len = bytes.length;
        if (len <= 0) return "";
        char[] ret = new char[len << 1];
        for (int i = 0, j = 0; i < len; i++) {
            ret[j++] = HEX_DIGITS[bytes[i] >> 4 & 0x0f];
            ret[j++] = HEX_DIGITS[bytes[i] & 0x0f];
        }
        return new String(ret);
    }

    /**
     * The application's information.
     */
    public static class AppInfo {

        private String packageName;
        private String name;
        private Drawable icon;
        private String packagePath;
        private String versionName;
        private int versionCode;
        private boolean isSystem;

        public Drawable getIcon() {
            return icon;
        }

        public void setIcon(final Drawable icon) {
            this.icon = icon;
        }

        public boolean isSystem() {
            return isSystem;
        }

        public void setSystem(final boolean isSystem) {
            this.isSystem = isSystem;
        }

        public String getPackageName() {
            return packageName;
        }

        public void setPackageName(final String packageName) {
            this.packageName = packageName;
        }

        public String getName() {
            return name;
        }

        public void setName(final String name) {
            this.name = name;
        }

        public String getPackagePath() {
            return packagePath;
        }

        public void setPackagePath(final String packagePath) {
            this.packagePath = packagePath;
        }

        public int getVersionCode() {
            return versionCode;
        }

        public void setVersionCode(final int versionCode) {
            this.versionCode = versionCode;
        }

        public String getVersionName() {
            return versionName;
        }

        public void setVersionName(final String versionName) {
            this.versionName = versionName;
        }

        public AppInfo(String packageName, String name, Drawable icon, String packagePath,
                       String versionName, int versionCode, boolean isSystem) {
            this.setName(name);
            this.setIcon(icon);
            this.setPackageName(packageName);
            this.setPackagePath(packagePath);
            this.setVersionName(versionName);
            this.setVersionCode(versionCode);
            this.setSystem(isSystem);
        }

        @Override
        public String toString() {
            return "pkg name: " + getPackageName() +
                    "\napp icon: " + getIcon() +
                    "\napp name: " + getName() +
                    "\napp path: " + getPackagePath() +
                    "\napp v name: " + getVersionName() +
                    "\napp v code: " + getVersionCode() +
                    "\nis system: " + isSystem();
        }
    }


}
