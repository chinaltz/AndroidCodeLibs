package com.androidcodelibs.androidutilslib.utils;

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.ImageFormat;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuff.Mode;
import android.graphics.PorterDuffColorFilter;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Shader.TileMode;
import android.graphics.YuvImage;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.TransitionDrawable;
import android.media.ExifInterface;
import android.os.Build;
import android.renderscript.Allocation;
import android.renderscript.Element;
import android.renderscript.RenderScript;
import android.renderscript.ScriptIntrinsicBlur;
import android.support.annotation.ColorInt;
import android.support.annotation.DrawableRes;
import android.support.annotation.FloatRange;
import android.support.annotation.IntRange;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.annotation.RequiresApi;
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.view.View.MeasureSpec;
import android.widget.ImageView;

import com.androidcodelibs.androidutilslib.constant.MemoryConstants;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/11 下午3:23.
 * Info 图片工具类
 */

public class ISImageUtils {
	
	private final static String TAG = "ISImageUtils";

	/** 图片处理：裁剪. */
	public static final int CUTIMG = 0;

	/** 图片处理：缩放. */
	public static final int SCALEIMG = 1;

	/** 图片处理：不处理. */
	public static final int ORIGINALIMG = 2;

	/** 图片最大宽度. */
	public static final int MAX_WIDTH = 4096/2;

	/** 图片最大高度. */
	public static final int MAX_HEIGHT = 4096/2;




    /**
     * 获取原图.
     * @param file File对象
     * @return Bitmap 图片
     */
    public static Bitmap getBitmap(File file) {
		if (file == null) return null;

        Bitmap resizeBmp = null;
        try {
            resizeBmp = BitmapFactory.decodeFile(file.getPath());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return resizeBmp;
    }

	/**
	 * 从互联网上获取原始大小图片.
	 * @param url 要下载文件的网络地址
	 * @return Bitmap 新图片
	 */
	public static Bitmap getBitmapByUrl(String url) {
        return getBitmap(url,-1,-1);
	}
	
	/**
	 * 从互联网上获取指定大小的图片.
	 * @param url
	 *            要下载文件的网络地址
	 * @param desiredWidth
	 *            新图片的宽
	 * @param desiredHeight
	 *            新图片的高
	 * @return Bitmap 新图片
	 */
	public static Bitmap getBitmapByUrl(String url, int desiredWidth, int desiredHeight) {
		Bitmap resizeBmp = null;
		URLConnection con = null;
		InputStream is = null;
		try {
			URL imageURL = new URL(url);
			con = imageURL.openConnection();
			con.setDoInput(true);
			con.connect();
			is = con.getInputStream();
            resizeBmp = getBitmap(is,desiredWidth,desiredHeight);
		} catch (Exception e) {
			e.printStackTrace();
			LogUtils.i(ISImageUtils.class, "" + e.getMessage());
		} finally {
			try {
				if (is != null) {
					is.close();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return resizeBmp;
	}
	
	/**
	 * 从流中获取指定大小的图片（压缩）.
	 * @param inputStream
	 * @param desiredWidth
	 * @param desiredHeight
	 * @return
	 */
	public static Bitmap getBitmap(InputStream inputStream, int desiredWidth, int desiredHeight) {
        Bitmap resizeBmp = null;
        try {

            if(desiredWidth <= 0 || desiredHeight <= 0){

                BitmapFactory.Options opts = new BitmapFactory.Options();
                // 默认为ARGB_8888.
                opts.inPreferredConfig = Config.RGB_565;

                // 以下两个字段需一起使用：
                // 产生的位图将得到像素空间，如果系统gc，那么将被清空。当像素再次被访问，如果Bitmap已经decode，那么将被自动重新解码
                opts.inPurgeable = true;
                // 位图可以共享一个参考输入数据(inputstream、阵列等)
                opts.inInputShareable = true;
                // 缩放的比例，缩放是很难按准备的比例进行缩放的，通过inSampleSize来进行缩放，其值表明缩放的倍数，SDK中建议其值是2的指数值
                opts.inSampleSize = 1;
                // 创建内存
                opts.inJustDecodeBounds = false;
                // 使图片不抖动
                opts.inDither = false;
                resizeBmp =  BitmapFactory.decodeStream(inputStream,null, opts);
            }else{
                byte [] data =  StreamUtils.stream2Bytes(inputStream);
                resizeBmp = getBitmap(data,desiredWidth,desiredHeight);
            }

        } catch (Exception e) {
            e.printStackTrace();
            LogUtils.e(ISImageUtils.class, "" + e.getMessage());
        }
        return resizeBmp;
	}
	
	/**
	 * 从byte数组获取预期大小的图片（压缩）.
	 * @param data
	 * @param desiredWidth
	 * @param desiredHeight
	 * @return
	 */
	public static Bitmap getBitmap(byte [] data, int desiredWidth, int desiredHeight) {
		Bitmap resizeBmp = null;
		try {
			BitmapFactory.Options opts = new BitmapFactory.Options();
			// 设置为true,decodeFile先不创建内存 只获取一些解码边界信息即图片大小信息
			opts.inJustDecodeBounds = true;
			BitmapFactory.decodeByteArray(data, 0, data.length, opts);

			// 获取图片的原始宽度高度
			int srcWidth = opts.outWidth;
			int srcHeight = opts.outHeight;

			//等比获取最大尺寸
			int[] size = resizeToMaxSize(srcWidth, srcHeight, desiredWidth, desiredHeight);
			desiredWidth = size[0];
			desiredHeight = size[1];

			// 默认为ARGB_8888.
			opts.inPreferredConfig = Config.RGB_565;

			// 以下两个字段需一起使用：
			// 产生的位图将得到像素空间，如果系统gc，那么将被清空。当像素再次被访问，如果Bitmap已经decode，那么将被自动重新解码
			opts.inPurgeable = true;
			// 位图可以共享一个参考输入数据(inputstream、阵列等)
			opts.inInputShareable = true;
			// 缩放的比例，缩放是很难按准备的比例进行缩放的，通过inSampleSize来进行缩放，其值表明缩放的倍数，SDK中建议其值是2的指数值
			int sampleSize = computeSampleSize(srcWidth,srcHeight,desiredWidth,desiredHeight);
			opts.inSampleSize = sampleSize;

			// 创建内存
			opts.inJustDecodeBounds = false;
			// 使图片不抖动
			opts.inDither = false;
			resizeBmp =  BitmapFactory.decodeByteArray(data, 0, data.length, opts);

            // 缩放的比例
            float scale = getMinScale(resizeBmp.getWidth(), resizeBmp.getHeight(), desiredWidth, desiredHeight);
            if(scale < 1){
                // 缩小
                resizeBmp = scaleBitmap(resizeBmp, scale);
            }

		} catch (Exception e) {
			e.printStackTrace();
			LogUtils.i(ISImageUtils.class, "" + e.getMessage());
		}
		return resizeBmp;
	}


	/**
	 * 缩放图片.
	 * 
	 * @param file
	 *            File对象
	 * @param desiredWidth
	 *            新图片的宽   根据原始图片比例会有不同
	 * @param desiredHeight
	 *            新图片的高   根据原始图片比例会有不同
	 * @return Bitmap 新图片
	 */
	public static Bitmap getScaleBitmap(File file, int desiredWidth, int desiredHeight) {

		BitmapFactory.Options opts = new BitmapFactory.Options();

		int[] size = getBitmapSize(file);

		// 获取图片的原始宽度高度
		int srcWidth = size[0];
		int srcHeight = size[1];
		
		//需要的尺寸重置
		int[] sizeNew = resizeToMaxSize(srcWidth, srcHeight, desiredWidth, desiredHeight);
		desiredWidth = sizeNew[0];
		desiredHeight = sizeNew[1];

		// 默认为ARGB_8888. 必须565  不然有水痕
		opts.inPreferredConfig = Config.RGB_565;

		// 以下两个字段需一起使用：
		// 产生的位图将得到像素空间，如果系统gc，那么将被清空。当像素再次被访问，如果Bitmap已经decode，那么将被自动重新解码
		opts.inPurgeable = true;
		// 位图可以共享一个参考输入数据(inputstream、阵列等)
		opts.inInputShareable = true;
		// 缩放的比例，缩放是很难按准备的比例进行缩放的，通过inSampleSize来进行缩放，其值表明缩放的倍数，SDK中建议其值是2的指数值
        int sampleSize = computeSampleSize(srcWidth,srcHeight,desiredWidth,desiredHeight);
		opts.inSampleSize = sampleSize;
		// 创建内存
		opts.inJustDecodeBounds = false;
		// 使图片不抖动
		opts.inDither = false;

		Bitmap resizeBmp = BitmapFactory.decodeFile(file.getPath(), opts);

		// 缩放的比例
		float scale = getMinScale(resizeBmp.getWidth(), resizeBmp.getHeight(), desiredWidth, desiredHeight);
		if(scale < 1){
			// 缩小
			resizeBmp = scaleBitmap(resizeBmp, scale);
		}

		return resizeBmp;
	}

    /**
     * 获取缩略图
     * @param file
     * @param desiredWidth
     * @param desiredHeight
     * @return
     */
    public static Bitmap getThumbnail(File file, int desiredWidth, int desiredHeight){

        BitmapFactory.Options opts = new BitmapFactory.Options();

        int[] size = getBitmapSize(file);

        // 获取图片的原始宽度高度
        int srcWidth = size[0];
        int srcHeight = size[1];

        //需要的尺寸重置
        int[] sizeNew = resizeToMaxSize(srcWidth, srcHeight, desiredWidth, desiredHeight);
        desiredWidth = sizeNew[0];
        desiredHeight = sizeNew[1];

        // 默认为ARGB_8888. 必须565  不然有水痕
        opts.inPreferredConfig = Config.RGB_565;

        // 以下两个字段需一起使用：
        // 产生的位图将得到像素空间，如果系统gc，那么将被清空。当像素再次被访问，如果Bitmap已经decode，那么将被自动重新解码
        opts.inPurgeable = true;
        // 位图可以共享一个参考输入数据(inputstream、阵列等)
        opts.inInputShareable = true;
        // 缩放的比例，缩放是很难按准备的比例进行缩放的，通过inSampleSize来进行缩放，其值表明缩放的倍数，SDK中建议其值是2的指数值
        //int sampleSize = computeSampleSize(srcWidth,srcHeight,desiredWidth,desiredHeight);

        double wr = (double) srcWidth / desiredWidth;
        double hr = (double) srcHeight / desiredHeight;
        double ratio = Math.min(wr, hr);
        double ratioMax = 1;
        float n = 1.0f;
        //2的倍数的最大值
        while(true){
            if((ratioMax *2) <= ratio){
                ratioMax *= 2;
            }else{
                ratioMax *= 2;
                break;
            }
        }

        while ((n * 2) <= ratioMax) {
            n *= 2;
        }

        opts.inSampleSize = (int)n;
        // 创建内存
        opts.inJustDecodeBounds = false;
        // 使图片不抖动
        opts.inDither = false;

        Bitmap resizeBmp = BitmapFactory.decodeFile(file.getPath(), opts);

        return resizeBmp;

    }

	/**
	 * 缩放图片.
	 *
	 * @param bitmap
	 *            the bitmap
	 * @param desiredWidth
	 *            新图片的宽
	 * @param desiredHeight
	 *            新图片的高
	 * @return Bitmap 新图片
	 */
	public static Bitmap getScaleBitmap(Bitmap bitmap, int desiredWidth, int desiredHeight) {

		if (!checkBitmap(bitmap)) {
			return null;
		}

		// 获得图片的宽高
		int srcWidth = bitmap.getWidth();
		int srcHeight = bitmap.getHeight();

		int[] size = resizeToMaxSize(srcWidth, srcHeight, desiredWidth, desiredHeight);
		desiredWidth = size[0];
		desiredHeight = size[1];

		Bitmap resizeBmp = null;
		float scale = getMinScale(srcWidth, srcHeight, desiredWidth, desiredHeight);
		if(scale < 1){
			// 缩小
			resizeBmp = scaleBitmap(bitmap, scale);
		}
		return resizeBmp;
	}


	/**
	 * 裁剪图片，先缩放后裁剪.
	 *
	 * @param file
	 *            File对象
	 * @param desiredWidth
	 *            新图片的宽
	 * @param desiredHeight
	 *            新图片的高
	 * @return Bitmap 新图片
	 */
	public static Bitmap getCutBitmap(File file, int desiredWidth, int desiredHeight) {

		BitmapFactory.Options opts = new BitmapFactory.Options();

		int[] size = getBitmapSize(file);

		// 获取图片的原始宽度高度
		int srcWidth = size[0];
		int srcHeight = size[1];

		//需要的尺寸重置
		int[] sizeNew = resizeToMaxSize(srcWidth, srcHeight, desiredWidth, desiredHeight);
		desiredWidth = sizeNew[0];
		desiredHeight = sizeNew[1];

		// 默认为ARGB_8888. 必须565  不然有水痕
		opts.inPreferredConfig = Config.RGB_565;

		// 以下两个字段需一起使用：
		// 产生的位图将得到像素空间，如果系统gc，那么将被清空。当像素再次被访问，如果Bitmap已经decode，那么将被自动重新解码
		opts.inPurgeable = true;
		// 位图可以共享一个参考输入数据(inputstream、阵列等)
		opts.inInputShareable = true;
		// 缩放的比例，缩放是很难按准备的比例进行缩放的，通过inSampleSize来进行缩放，其值表明缩放的倍数，SDK中建议其值是2的指数值
        int sampleSize = computeSampleSize(srcWidth,srcHeight,desiredWidth,desiredHeight);
		opts.inSampleSize = sampleSize;
		// 创建内存
		opts.inJustDecodeBounds = false;
		// 使图片不抖动
		opts.inDither = false;
		Bitmap resizeBmp = BitmapFactory.decodeFile(file.getPath(), opts);

        // 缩放的比例,缩小或者放大
        float scale = getMinScale(resizeBmp.getWidth(), resizeBmp.getHeight(), desiredWidth, desiredHeight);
		resizeBmp = scaleBitmap(resizeBmp, scale);

        //超出的裁掉
        if (resizeBmp.getWidth() > desiredWidth || resizeBmp.getHeight() > desiredHeight) {
            resizeBmp  = getCutBitmap(resizeBmp,desiredWidth,desiredHeight);
        }
		return resizeBmp;
	}

	/**
	 * 裁剪图片.
	 * 
	 * @param bitmap
	 *            the bitmap
	 * @param desiredWidth
	 *            新图片的宽
	 * @param desiredHeight
	 *            新图片的高
	 * @return Bitmap 新图片
	 */
	public static Bitmap getCutBitmap(Bitmap bitmap, int desiredWidth, int desiredHeight) {

		if (!checkBitmap(bitmap)) {
			return null;
		}
		
		if (!checkSize(desiredWidth, desiredHeight)) {
			return null;
		}

		Bitmap resizeBmp = null;

		try {
			int width = bitmap.getWidth();
			int height = bitmap.getHeight();

			int offsetX = 0;
			int offsetY = 0;

			if (width > desiredWidth) {
				offsetX = (width - desiredWidth) / 2;
			} else {
				desiredWidth = width;
			}

			if (height > desiredHeight) {
				offsetY = (height - desiredHeight) / 2;
			} else {
				desiredHeight = height;
			}

			resizeBmp = Bitmap.createBitmap(bitmap, offsetX, offsetY, desiredWidth,desiredHeight);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (resizeBmp != bitmap) {
				bitmap.recycle();
			}
		}
		return resizeBmp;
	}
	
	/**
	 * 根据等比例缩放图片.
	 * 
	 * @param bitmap
	 *            the bitmap
	 * @param scale
	 *            比例
	 * @return Bitmap 新图片
	 */
	public static Bitmap scaleBitmap(Bitmap bitmap, float scale) {

		if (!checkBitmap(bitmap)) {
			return null;
		}

		if (scale == 1) {
			return bitmap;
		}

		Bitmap resizeBmp = null;
		try {
			// 获取Bitmap资源的宽和高
			int bmpW = bitmap.getWidth();
			int bmpH = bitmap.getHeight();
			
			// 注意这个Matirx是android.graphics底下的那个
			Matrix matrix = new Matrix();
			// 设置缩放系数，分别为原来的0.8和0.8
			matrix.postScale(scale, scale);
			resizeBmp = Bitmap.createBitmap(bitmap, 0, 0, bmpW, bmpH, matrix, true);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (resizeBmp != bitmap) {
				bitmap.recycle();
			}
		}
		return resizeBmp;
	}
	
	/**
	 * 获取图片尺寸
	 * 
	 * @param file File对象
	 * @return Bitmap 新图片
	 */
	public static int[] getBitmapSize(File file) {
		int[] size = new int[2];
		BitmapFactory.Options opts = new BitmapFactory.Options();
		// 设置为true,decodeFile先不创建内存 只获取一些解码边界信息即图片大小信息
		opts.inJustDecodeBounds = true;
		BitmapFactory.decodeFile(file.getPath(), opts);
		// 获取图片的原始宽度高度
		size[0] = opts.outWidth;
		size[1] = opts.outHeight;
		return size;
	}

	/**
	 * 
	 * 获取缩小的比例.
	 * @param srcWidth
	 * @param srcHeight
	 * @param desiredWidth
	 * @param desiredHeight
	 * @return
	 */
	private static float getMinScale(int srcWidth, int srcHeight, int desiredWidth,
			int desiredHeight) {

        // 缩放的比例
        if(desiredWidth <= 0 || desiredHeight <= 0){
            return 1;
        }

        float scale = 0;
		// 计算缩放比例，宽高的最小比例
		float scaleWidth = (float) desiredWidth / srcWidth;
		float scaleHeight = (float) desiredHeight / srcHeight;
		if (scaleWidth > scaleHeight) {
			scale = scaleWidth;
		} else {
			scale = scaleHeight;
		}
		
		return scale;
	}

	private static int[] resizeToMaxSize(int srcWidth, int srcHeight,
			int desiredWidth, int desiredHeight) {
		int[] size = new int[2];
		if(desiredWidth <= 0){
			desiredWidth = srcWidth;
		}
		if(desiredHeight <= 0){
			desiredHeight = srcHeight;
		}
		if (desiredWidth > MAX_WIDTH) {
			// 重新计算大小
			desiredWidth = MAX_WIDTH;
			float scaleWidth = (float) desiredWidth / srcWidth;
			desiredHeight = (int) (desiredHeight * scaleWidth);
		}

		if (desiredHeight > MAX_HEIGHT) {
			// 重新计算大小
			desiredHeight = MAX_HEIGHT;
			float scaleHeight = (float) desiredHeight / srcHeight;
			desiredWidth = (int) (desiredWidth * scaleHeight);
		}
		size[0] = desiredWidth;
		size[1] = desiredHeight;
		return size;
	}

	private static boolean checkBitmap(Bitmap bitmap) {
		if (bitmap == null) {
			LogUtils.e(ISImageUtils.class, "原图Bitmap为空了");
			return false;
		}

		if (bitmap.getWidth() <= 0 || bitmap.getHeight() <= 0) {
			LogUtils.i(ISImageUtils.class, "原图Bitmap大小为0");
			return false;
		}
		return true;
	}

	private static boolean checkSize(int desiredWidth, int desiredHeight) {
		if (desiredWidth <= 0 || desiredHeight <= 0) {
			LogUtils.e(ISImageUtils.class, "请求Bitmap的宽高参数必须大于0");
			return false;
		}
		return true;
	}

	/**
	 * Drawable转Bitmap.
	 * 
	 * @param drawable
	 *            要转化的Drawable
	 * @return Bitmap
	 */
	public static Bitmap drawableToBitmap(Drawable drawable) {
		Bitmap bitmap = Bitmap
				.createBitmap(
						drawable.getIntrinsicWidth(),
						drawable.getIntrinsicHeight(),
						drawable.getOpacity() != PixelFormat.OPAQUE ? Config.ARGB_8888
								: Config.RGB_565);
		Canvas canvas = new Canvas(bitmap);
		drawable.setBounds(0, 0, drawable.getIntrinsicWidth(),
				drawable.getIntrinsicHeight());
		drawable.draw(canvas);
		return bitmap;
	}

	/**
	 * Bitmap对象转换Drawable对象.
	 * 
	 * @param bitmap
	 *            要转化的Bitmap对象
	 * @return Drawable 转化完成的Drawable对象
	 */
	public static Drawable bitmapToDrawable(Bitmap bitmap) {
		BitmapDrawable mBitmapDrawable = null;
		try {
			if (bitmap == null) {
				return null;
			}
			mBitmapDrawable = new BitmapDrawable(bitmap);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mBitmapDrawable;
	}

	/**
	 * Bitmap对象转换TransitionDrawable对象.
	 * 
	 * @param bitmap
	 *            要转化的Bitmap对象 imageView.setImageDrawable(td);
	 *            td.startTransition(200);
	 * @return Drawable 转化完成的Drawable对象
	 */
	@Nullable
	public static TransitionDrawable bitmapToTransitionDrawable(Bitmap bitmap) {
		TransitionDrawable mBitmapDrawable = null;
		try {
			if (bitmap == null) {
				return null;
			}
			mBitmapDrawable = new TransitionDrawable(new Drawable[] {
					new ColorDrawable(Color.TRANSPARENT),
					new BitmapDrawable(bitmap) });
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mBitmapDrawable;
	}

	/**
	 * Drawable对象转换TransitionDrawable对象.
	 * 
	 * @param drawable
	 *            要转化的Drawable对象 imageView.setImageDrawable(td);
	 *            td.startTransition(200);
	 * @return Drawable 转化完成的Drawable对象
	 */
	public static TransitionDrawable drawableToTransitionDrawable(Drawable drawable) {
		TransitionDrawable mBitmapDrawable = null;
		try {
			if (drawable == null) {
				return null;
			}
			mBitmapDrawable = new TransitionDrawable(new Drawable[] {
					new ColorDrawable(Color.TRANSPARENT), drawable });
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mBitmapDrawable;
	}

	/**
	 * 将Bitmap转换为byte[].
	 * 
	 * @param bitmap
	 *            the bitmap
	 * @param mCompressFormat
	 *            图片格式 Bitmap.CompressFormat.JPEG,CompressFormat.PNG
	 * @param needRecycle
	 *            是否需要回收
	 * @return byte[] 图片的byte[]
	 */
	public static byte[] bitmap2Bytes(Bitmap bitmap,
                                      Bitmap.CompressFormat mCompressFormat, final boolean needRecycle) {
		byte[] result = null;
		ByteArrayOutputStream output = null;
		try {
			output = new ByteArrayOutputStream();
			bitmap.compress(mCompressFormat, 70, output);
			result = output.toByteArray();
			if (needRecycle) {
				bitmap.recycle();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (output != null) {
				try {
					output.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return result;
	}

	/**
	 * 获取Bitmap大小.
	 * 
	 * @param bitmap
	 *            the bitmap
	 * @param mCompressFormat
	 *            图片格式 Bitmap.CompressFormat.JPEG,CompressFormat.PNG
	 * @return 图片的大小
	 */
	public static int getByteCount(Bitmap bitmap,
			Bitmap.CompressFormat mCompressFormat) {
		int size = 0;
		ByteArrayOutputStream output = null;
		try {
			output = new ByteArrayOutputStream();
			bitmap.compress(mCompressFormat, 70, output);
			byte[] result = output.toByteArray();
			size = result.length;
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (output != null) {
				try {
					output.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
		return size;
	}

	/**
	 * 将byte[]转换为Bitmap.
	 * 
	 * @param b
	 *            图片格式的byte[]数组
	 * @return bitmap 得到的Bitmap
	 */
	public static Bitmap bytes2Bimap(byte[] b) {
		Bitmap bitmap = null;
		try {
			if (b.length != 0) {
				bitmap = BitmapFactory.decodeByteArray(b, 0, b.length);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return bitmap;
	}

	/**
	 * 将ImageView转换为Bitmap.
	 * 
	 * @param view
	 *            要转换为bitmap的View
	 * @return byte[] 图片的byte[]
	 */
	public static Bitmap imageView2Bitmap(ImageView view) {
		Bitmap bitmap = null;
		try {
			bitmap = Bitmap.createBitmap(view.getDrawingCache());
			view.setDrawingCacheEnabled(false);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return bitmap;
	}

	/**
	 * 将View转换为Drawable.需要最上层布局为Linearlayout
	 * 
	 * @param view
	 *            要转换为Drawable的View
	 * @return BitmapDrawable Drawable
	 */
	public static Drawable view2Drawable(View view) {
		BitmapDrawable mBitmapDrawable = null;
		try {
			Bitmap newbmp = view2Bitmap(view);
			if (newbmp != null) {
				mBitmapDrawable = new BitmapDrawable(newbmp);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mBitmapDrawable;
	}

	/**
	 * 将View转换为Bitmap.需要最上层布局为Linearlayout
	 * 
	 * @param view
	 *            要转换为bitmap的View
	 * @return byte[] 图片的byte[]
	 */
	public static Bitmap view2Bitmap(View view) {
		Bitmap bitmap = null;
		try {
			if (view != null) {
				view.setDrawingCacheEnabled(true);
				view.measure(
						MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED),
						MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED));
				view.layout(0, 0, view.getMeasuredWidth(),
						view.getMeasuredHeight());
				view.buildDrawingCache();
				bitmap = view.getDrawingCache();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return bitmap;
	}

	/**
	 * 将View转换为byte[].
	 * 
	 * @param view
	 *            要转换为byte[]的View
	 * @param compressFormat
	 *            the compress format
	 * @return byte[] View图片的byte[]
	 */
	public static byte[] view2Bytes(View view,
			Bitmap.CompressFormat compressFormat) {
		byte[] b = null;
		try {
			Bitmap bitmap = ISImageUtils.view2Bitmap(view);
			b = ISImageUtils.bitmap2Bytes(bitmap, compressFormat, true);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return b;
	}

	/**
	 * 旋转Bitmap为一定的角度.
	 * 
	 * @param bitmap
	 *            the bitmap
	 * @param degrees
	 *            the degrees
	 * @return the bitmap
	 */
	public static Bitmap rotateBitmap(Bitmap bitmap, float degrees) {
		Bitmap mBitmap = null;
		try {
			Matrix m = new Matrix();
			m.setRotate(degrees % 360);
			mBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(),
					bitmap.getHeight(), m, false);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mBitmap;
	}

	/**
	 * 旋转Bitmap为一定的角度并四周暗化处理.
	 * 
	 * @param bitmap
	 *            the bitmap
	 * @param degrees
	 *            the degrees
	 * @return the bitmap
	 */
	public static Bitmap rotateBitmapTranslate(Bitmap bitmap, float degrees) {
		Bitmap mBitmap = null;
		int width;
		int height;
		try {
			Matrix matrix = new Matrix();
			if ((degrees / 90) % 2 != 0) {
				width = bitmap.getWidth();
				height = bitmap.getHeight();
			} else {
				width = bitmap.getHeight();
				height = bitmap.getWidth();
			}
			int cx = width / 2;
			int cy = height / 2;
			matrix.preTranslate(-cx, -cy);
			matrix.postRotate(degrees);
			matrix.postTranslate(cx, cy);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return mBitmap;
	}

	/**
	 * 转换图片转换成圆形.
	 * 
	 * @param bitmap
	 *            传入Bitmap对象
	 * @return the bitmap
	 */
	public static Bitmap toRoundBitmap(Bitmap bitmap) {
		if (bitmap == null) {
			return null;
		}
		int width = bitmap.getWidth();
		int height = bitmap.getHeight();
		float roundPx;
		float left, top, right, bottom, dst_left, dst_top, dst_right, dst_bottom;
		if (width <= height) {
			roundPx = width / 2;
			top = 0;
			bottom = width;
			left = 0;
			right = width;
			height = width;
			dst_left = 0;
			dst_top = 0;
			dst_right = width;
			dst_bottom = width;
		} else {
			roundPx = height / 2;
			float clip = (width - height) / 2;
			left = clip;
			right = width - clip;
			top = 0;
			bottom = height;
			width = height;
			dst_left = 0;
			dst_top = 0;
			dst_right = height;
			dst_bottom = height;
		}

		Bitmap output = Bitmap.createBitmap(width, height, Config.ARGB_8888);
		Canvas canvas = new Canvas(output);
		final int color = 0xff424242;
		final Paint paint = new Paint();
		final Rect src = new Rect((int) left, (int) top, (int) right,
				(int) bottom);
		final Rect dst = new Rect((int) dst_left, (int) dst_top,
				(int) dst_right, (int) dst_bottom);
		final RectF rectF = new RectF(dst);
		paint.setAntiAlias(true);
		canvas.drawARGB(0, 0, 0, 0);
		paint.setColor(color);
		canvas.drawRoundRect(rectF, roundPx, roundPx, paint);
		paint.setXfermode(new PorterDuffXfermode(Mode.SRC_IN));
		canvas.drawBitmap(bitmap, src, dst, paint);
		return output;
	}

	/**
	 * 转换图片转换成圆角
	 * @param bitmap
	 * @param roundPx
     * @return
     */
	public static Bitmap toRoundBitmap(Bitmap bitmap, int roundPx) {
		if (bitmap == null) {
			return null;
		}
		int width = bitmap.getWidth();
		int height = bitmap.getHeight();
		float left, top, right, bottom, dst_left, dst_top, dst_right, dst_bottom;
		if (width <= height) {
			top = 0;
			bottom = width;
			left = 0;
			right = width;
			height = width;
			dst_left = 0;
			dst_top = 0;
			dst_right = width;
			dst_bottom = width;
		} else {
			float clip = (width - height) / 2;
			left = clip;
			right = width - clip;
			top = 0;
			bottom = height;
			width = height;
			dst_left = 0;
			dst_top = 0;
			dst_right = height;
			dst_bottom = height;
		}

		Bitmap output = Bitmap.createBitmap(width, height, Config.ARGB_8888);
		Canvas canvas = new Canvas(output);
		final int color = 0xff424242;
		final Paint paint = new Paint();
		final Rect src = new Rect((int) left, (int) top, (int) right,
				(int) bottom);
		final Rect dst = new Rect((int) dst_left, (int) dst_top,
				(int) dst_right, (int) dst_bottom);
		final RectF rectF = new RectF(dst);
		paint.setAntiAlias(true);
		canvas.drawARGB(0, 0, 0, 0);
		paint.setColor(color);
		canvas.drawRoundRect(rectF, roundPx, roundPx, paint);
		paint.setXfermode(new PorterDuffXfermode(Mode.SRC_IN));
		canvas.drawBitmap(bitmap, src, dst, paint);
		return output;
	}

	/**
	 * 转换图片转换成镜面效果的图片.
	 * 
	 * @param bitmap
	 *            传入Bitmap对象
	 * @return the bitmap
	 */
	public static Bitmap toReflectionBitmap(Bitmap bitmap) {
		if (bitmap == null) {
			return null;
		}

		try {
			int reflectionGap = 1;
			int width = bitmap.getWidth();
			int height = bitmap.getHeight();

			// This will not scale but will flip on the Y axis
			Matrix matrix = new Matrix();
			matrix.preScale(1, -1);

			// Create a Bitmap with the flip matrix applied to it.
			// We only want the bottom half of the image
			Bitmap reflectionImage = Bitmap.createBitmap(bitmap, 0, height / 2,
					width, height / 2, matrix, false);

			// Create a new bitmap with same width but taller to fit
			// reflection
			Bitmap bitmapWithReflection = Bitmap.createBitmap(width,
					(height + height / 2), Config.ARGB_8888);

			// Create a new Canvas with the bitmap that's big enough for
			// the image plus gap plus reflection
			Canvas canvas = new Canvas(bitmapWithReflection);
			// Draw in the original image
			canvas.drawBitmap(bitmap, 0, 0, null);
			// Draw in the gap
			Paint deafaultPaint = new Paint();
			canvas.drawRect(0, height, width, height + reflectionGap,
					deafaultPaint);
			// Draw in the reflection
			canvas.drawBitmap(reflectionImage, 0, height + reflectionGap, null);
			// Create a shader that is a linear gradient that covers the
			// reflection
			Paint paint = new Paint();
			LinearGradient shader = new LinearGradient(0, bitmap.getHeight(),
					0, bitmapWithReflection.getHeight() + reflectionGap,
					0x70ffffff, 0x00ffffff, TileMode.CLAMP);
			// Set the paint to use this shader (linear gradient)
			paint.setShader(shader);
			// Set the Transfer mode to be porter duff and destination in
			paint.setXfermode(new PorterDuffXfermode(Mode.DST_IN));
			// Draw a rectangle using the paint with our linear gradient
			canvas.drawRect(0, height, width, bitmapWithReflection.getHeight()
					+ reflectionGap, paint);

			bitmap = bitmapWithReflection;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return bitmap;
	}

	/**
	 * 释放Bitmap对象.
	 * 
	 * @param bitmap
	 *            要释放的Bitmap
	 */
	public static void releaseBitmap(Bitmap bitmap) {
		if (bitmap != null) {
			try {
				if (!bitmap.isRecycled()) {
					LogUtils.i(ISImageUtils.class,
							"Bitmap释放" + bitmap.toString());
					bitmap.recycle();
				}
			} catch (Exception e) {
			}
			bitmap = null;
		}
	}

	/**
	 * 释放Bitmap数组.
	 * 
	 * @param bitmaps
	 *            要释放的Bitmap数组
	 */
	public static void releaseBitmapArray(Bitmap[] bitmaps) {
		if (bitmaps != null) {
			try {
				for (Bitmap bitmap : bitmaps) {
					if (bitmap != null && !bitmap.isRecycled()) {
						LogUtils.e(ISImageUtils.class,
								"Bitmap释放" + bitmap.toString());
						bitmap.recycle();
					}
				}
			} catch (Exception e) {
			}
		}
	}
	
	/**
	 * 
	 * 将yuv格式转换成灰度bitmap.
	 * @param yuvData
	 * @param width
	 * @param height
	 * @return
	 */
	public Bitmap yuv2GrayBitmap(byte[] yuvData, int width, int height) {
		int[] pixels = new int[width * height];
		byte[] yuv = yuvData;
		int inputOffset = 0;
		for (int y = 0; y < height; y++) {
			int outputOffset = y * width;
			for (int x = 0; x < width; x++) {
				int grey = yuv[inputOffset + x] & 0xff;
				pixels[outputOffset + x] = 0xFF000000 | (grey * 0x00010101);
			}
			inputOffset += width;
		}

		Bitmap bitmap = Bitmap.createBitmap(width, height, Config.ARGB_8888);
		bitmap.setPixels(pixels, 0, width, 0, 0, width, height);
		return bitmap;
	}

	/**
	 * 将yuv格式转换成bitmap
	 * ImageFormat.NV21 || format == ImageFormat.YUY2
	 * @param data yuv 数据
	 * @param width
	 * @param height
	 * @return RGB565 format bitmap
	 */
	public static Bitmap yuv2Bitmap(byte[] data, int width, int height) {
		final YuvImage image = new YuvImage(data, ImageFormat.NV21, width, height, null);
	    ByteArrayOutputStream os = new ByteArrayOutputStream(data.length);
	    if(!image.compressToJpeg(new Rect(0, 0, width, height), 100, os)){
	        return null;
	    }
	    byte[] tmp = os.toByteArray();
	    Bitmap bitmap = BitmapFactory.decodeByteArray(tmp, 0,tmp.length);
		return bitmap;
	}
		
	/**
	 * 
	 * Yuv
	 * ImageFormat.NV21 || format == ImageFormat.YUY2.
	 * @param data
	 * @param width
	 * @param height
	 * @param rect
	 * @return
	 */
    public static Bitmap cropYuv2Bitmap(byte []data, int width, int height, Rect rect){
		int w = rect.width();
		int h = rect.height();
		int frameSize = width*height;
		int []pixels = new int [w*h];
		byte []yuv = data;
		int yOffset = rect.top*width + rect.left;
		int uvOffset = (rect.top/2)*width + (rect.left/2)*2 + frameSize;
		int y, u, v, k;
		
		for(int i = 0; i < h; ++i){
			int outputOffset = i*w;
			for(int j = 0; j < w; ++j){
				y = (0xff & yuv[yOffset+j])-16;
				
				k = ((j>>1)<<1);
				v = (0xff & yuv[uvOffset+k])-128;
				u = (0xff & yuv[uvOffset+k+1])-128;
				
	            int y1192 = 1192 * y;
                int r = (y1192 + 1634 * v);
                int g = (y1192 - 833 * v - 400 * u);
                int b = (y1192 + 2066 * u);

                if (r < 0) r = 0; else if (r > 262143) r = 262143;
                if (g < 0) g = 0; else if (g > 262143) g = 262143;
                if (b < 0) b = 0; else if (b > 262143) b = 262143;

                pixels[outputOffset+j] = 0xff000000 | ((r << 6) & 0xff0000) | ((g >> 2) & 0xff00) | ((b >> 10) & 0xff);
			}
			yOffset += width;
			if(((rect.top+i) & 1) == 1){ uvOffset+= width; }
		}
		Bitmap bitmap = Bitmap.createBitmap(w, h, Config.ARGB_8888);
		bitmap.setPixels(pixels, 0, w, 0, 0, w, h);
		return bitmap;
    }

	/**
	 * 找到最合适的SampleSize
	 * @param width
	 * @param height
	 * @param desiredWidth
	 * @param desiredHeight
	 * @return
	 */
	private static int computeSampleSize(int width, int height, int desiredWidth, int desiredHeight) {
		double wr = (double) width / desiredWidth;
		double hr = (double) height / desiredHeight;
		double ratio = Math.min(wr, hr);
        float n = 1.0f;
        while ((n * 2) <= ratio) {
            n *= 2;
        }
		return (int) n;
	}



	private ISImageUtils() {
		throw new UnsupportedOperationException("u can't instantiate me...");
	}

	/**
	 * Bitmap to bytes.
	 *
	 * @param bitmap The bitmap.
	 * @param format The format of bitmap.
	 * @return bytes
	 */
	public static byte[] bitmap2Bytes(final Bitmap bitmap, final Bitmap.CompressFormat format) {
		if (bitmap == null) return null;
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		bitmap.compress(format, 100, baos);
		return baos.toByteArray();
	}

	/**
	 * Bytes to bitmap.
	 *
	 * @param bytes The bytes.
	 * @return bitmap
	 */
	public static Bitmap bytes2Bitmap(final byte[] bytes) {
		return (bytes == null || bytes.length == 0)
				? null
				: BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
	}

	/**
	 * Drawable to bitmap.
	 *
	 * @param drawable The drawable.
	 * @return bitmap
	 */
	public static Bitmap drawable2Bitmap(final Drawable drawable) {
		if (drawable instanceof BitmapDrawable) {
			BitmapDrawable bitmapDrawable = (BitmapDrawable) drawable;
			if (bitmapDrawable.getBitmap() != null) {
				return bitmapDrawable.getBitmap();
			}
		}
		Bitmap bitmap;
		if (drawable.getIntrinsicWidth() <= 0 || drawable.getIntrinsicHeight() <= 0) {
			bitmap = Bitmap.createBitmap(1, 1,
					drawable.getOpacity() != PixelFormat.OPAQUE
							? Bitmap.Config.ARGB_8888
							: Bitmap.Config.RGB_565);
		} else {
			bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(),
					drawable.getIntrinsicHeight(),
					drawable.getOpacity() != PixelFormat.OPAQUE
							? Bitmap.Config.ARGB_8888
							: Bitmap.Config.RGB_565);
		}
		Canvas canvas = new Canvas(bitmap);
		drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
		drawable.draw(canvas);
		return bitmap;
	}

	/**
	 * Bitmap to drawable.
	 *
	 * @param bitmap The bitmap.
	 * @return drawable
	 */
	public static Drawable bitmap2Drawable(final Bitmap bitmap) {
		return bitmap == null ? null : new BitmapDrawable(Utils.getApp().getResources(), bitmap);
	}

	/**
	 * Drawable to bytes.
	 *
	 * @param drawable The drawable.
	 * @param format   The format of bitmap.
	 * @return bytes
	 */
	public static byte[] drawable2Bytes(final Drawable drawable, final Bitmap.CompressFormat format) {
		return drawable == null ? null : bitmap2Bytes(drawable2Bitmap(drawable), format);
	}

	/**
	 * Bytes to drawable.
	 *
	 * @param bytes The bytes.
	 * @return drawable
	 */
	public static Drawable bytes2Drawable(final byte[] bytes) {
		return bitmap2Drawable(bytes2Bitmap(bytes));
	}

	/**
	 * View to bitmap.
	 *
	 * @param view The view.
	 * @return bitmap
	 */
//	public static Bitmap view2Bitmap(final View view) {
//		if (view == null) return null;
//		Bitmap ret = Bitmap.createBitmap(view.getWidth(),
//				view.getHeight(),
//				Bitmap.Config.ARGB_8888);
//		Canvas canvas = new Canvas(ret);
//		Drawable bgDrawable = view.getBackground();
//		if (bgDrawable != null) {
//			bgDrawable.draw(canvas);
//		} else {
//			canvas.drawColor(Color.WHITE);
//		}
//		view.draw(canvas);
//		return ret;
//	}

//	/**
//	 * Return bitmap.
//	 *
//	 * @param file The file.
//	 * @return bitmap
//	 */
//	public static Bitmap getBitmap(final File file) {
//
//		return BitmapFactory.decodeFile(file.getAbsolutePath());
//	}

	/**
	 * Return bitmap.
	 *
	 * @param file      The file.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final File file, final int maxWidth, final int maxHeight) {
		if (file == null) return null;
		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inJustDecodeBounds = true;
		BitmapFactory.decodeFile(file.getAbsolutePath(), options);
		options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight);
		options.inJustDecodeBounds = false;
		return BitmapFactory.decodeFile(file.getAbsolutePath(), options);
	}

	/**
	 * Return bitmap.
	 *
	 * @param filePath The path of file.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final String filePath) {
		if (isSpace(filePath)) return null;
		return BitmapFactory.decodeFile(filePath);
	}

	/**
	 * Return bitmap.
	 *
	 * @param filePath  The path of file.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final String filePath, final int maxWidth, final int maxHeight) {
		if (isSpace(filePath)) return null;
		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inJustDecodeBounds = true;
		BitmapFactory.decodeFile(filePath, options);
		options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight);
		options.inJustDecodeBounds = false;
		return BitmapFactory.decodeFile(filePath, options);
	}

	/**
	 * Return bitmap.
	 *
	 * @param is The input stream.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final InputStream is) {
		if (is == null) return null;
		return BitmapFactory.decodeStream(is);
	}

	/**
	 * Return bitmap.
	 *
	 * @param is        The input stream.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return bitmap
	 */
//	public static Bitmap getBitmap(final InputStream is, final int maxWidth, final int maxHeight) {
//		if (is == null) return null;
//		byte[] bytes = input2Byte(is);
//		return getBitmap(bytes, 0, maxWidth, maxHeight);
//	}

	/**
	 * Return bitmap.
	 *
	 * @param data   The data.
	 * @param offset The offset.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final byte[] data, final int offset) {
		if (data.length == 0) return null;
		return BitmapFactory.decodeByteArray(data, offset, data.length);
	}

	/**
	 * Return bitmap.
	 *
	 * @param data      The data.
	 * @param offset    The offset.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final byte[] data,
								   final int offset,
								   final int maxWidth,
								   final int maxHeight) {
		if (data.length == 0) return null;
		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inJustDecodeBounds = true;
		BitmapFactory.decodeByteArray(data, offset, data.length, options);
		options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight);
		options.inJustDecodeBounds = false;
		return BitmapFactory.decodeByteArray(data, offset, data.length, options);
	}

	/**
	 * Return bitmap.
	 *
	 * @param resId The resource id.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(@DrawableRes final int resId) {
		Drawable drawable = ContextCompat.getDrawable(Utils.getApp(), resId);
		Canvas canvas = new Canvas();
		Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(),
				drawable.getIntrinsicHeight(),
				Bitmap.Config.ARGB_8888);
		canvas.setBitmap(bitmap);
		drawable.setBounds(0, 0, drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
		drawable.draw(canvas);
		return bitmap;
	}

	/**
	 * Return bitmap.
	 *
	 * @param resId     The resource id.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(@DrawableRes final int resId,
								   final int maxWidth,
								   final int maxHeight) {
		BitmapFactory.Options options = new BitmapFactory.Options();
		final Resources resources = Utils.getApp().getResources();
		options.inJustDecodeBounds = true;
		BitmapFactory.decodeResource(resources, resId, options);
		options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight);
		options.inJustDecodeBounds = false;
		return BitmapFactory.decodeResource(resources, resId, options);
	}

	/**
	 * Return bitmap.
	 *
	 * @param fd The file descriptor.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final FileDescriptor fd) {
		if (fd == null) return null;
		return BitmapFactory.decodeFileDescriptor(fd);
	}

	/**
	 * Return bitmap.
	 *
	 * @param fd        The file descriptor
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return bitmap
	 */
	public static Bitmap getBitmap(final FileDescriptor fd,
								   final int maxWidth,
								   final int maxHeight) {
		if (fd == null) return null;
		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inJustDecodeBounds = true;
		BitmapFactory.decodeFileDescriptor(fd, null, options);
		options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight);
		options.inJustDecodeBounds = false;
		return BitmapFactory.decodeFileDescriptor(fd, null, options);
	}

	/**
	 * Return the bitmap with the specified color.
	 *
	 * @param src   The source of bitmap.
	 * @param color The color.
	 * @return the bitmap with the specified color
	 */
	public static Bitmap drawColor(@NonNull final Bitmap src, @ColorInt final int color) {
		return drawColor(src, color, false);
	}

	/**
	 * Return the bitmap with the specified color.
	 *
	 * @param src     The source of bitmap.
	 * @param color   The color.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the bitmap with the specified color
	 */
	public static Bitmap drawColor(@NonNull final Bitmap src,
								   @ColorInt final int color,
								   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = recycle ? src : src.copy(src.getConfig(), true);
		Canvas canvas = new Canvas(ret);
		canvas.drawColor(color, PorterDuff.Mode.DARKEN);
		return ret;
	}

	/**
	 * Return the scaled bitmap.
	 *
	 * @param src       The source of bitmap.
	 * @param newWidth  The new width.
	 * @param newHeight The new height.
	 * @return the scaled bitmap
	 */
	public static Bitmap scale(final Bitmap src, final int newWidth, final int newHeight) {
		return scale(src, newWidth, newHeight, false);
	}

	/**
	 * Return the scaled bitmap.
	 *
	 * @param src       The source of bitmap.
	 * @param newWidth  The new width.
	 * @param newHeight The new height.
	 * @param recycle   True to recycle the source of bitmap, false otherwise.
	 * @return the scaled bitmap
	 */
	public static Bitmap scale(final Bitmap src,
							   final int newWidth,
							   final int newHeight,
							   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = Bitmap.createScaledBitmap(src, newWidth, newHeight, true);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the scaled bitmap
	 *
	 * @param src         The source of bitmap.
	 * @param scaleWidth  The scale of width.
	 * @param scaleHeight The scale of height.
	 * @return the scaled bitmap
	 */
	public static Bitmap scale(final Bitmap src, final float scaleWidth, final float scaleHeight) {
		return scale(src, scaleWidth, scaleHeight, false);
	}

	/**
	 * Return the scaled bitmap
	 *
	 * @param src         The source of bitmap.
	 * @param scaleWidth  The scale of width.
	 * @param scaleHeight The scale of height.
	 * @param recycle     True to recycle the source of bitmap, false otherwise.
	 * @return the scaled bitmap
	 */
	public static Bitmap scale(final Bitmap src,
							   final float scaleWidth,
							   final float scaleHeight,
							   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Matrix matrix = new Matrix();
		matrix.setScale(scaleWidth, scaleHeight);
		Bitmap ret = Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), matrix, true);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the clipped bitmap.
	 *
	 * @param src    The source of bitmap.
	 * @param x      The x coordinate of the first pixel.
	 * @param y      The y coordinate of the first pixel.
	 * @param width  The width.
	 * @param height The height.
	 * @return the clipped bitmap
	 */
	public static Bitmap clip(final Bitmap src,
							  final int x,
							  final int y,
							  final int width,
							  final int height) {
		return clip(src, x, y, width, height, false);
	}

	/**
	 * Return the clipped bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param x       The x coordinate of the first pixel.
	 * @param y       The y coordinate of the first pixel.
	 * @param width   The width.
	 * @param height  The height.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the clipped bitmap
	 */
	public static Bitmap clip(final Bitmap src,
							  final int x,
							  final int y,
							  final int width,
							  final int height,
							  final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = Bitmap.createBitmap(src, x, y, width, height);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the skewed bitmap.
	 *
	 * @param src The source of bitmap.
	 * @param kx  The skew factor of x.
	 * @param ky  The skew factor of y.
	 * @return the skewed bitmap
	 */
	public static Bitmap skew(final Bitmap src, final float kx, final float ky) {
		return skew(src, kx, ky, 0, 0, false);
	}

	/**
	 * Return the skewed bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param kx      The skew factor of x.
	 * @param ky      The skew factor of y.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the skewed bitmap
	 */
	public static Bitmap skew(final Bitmap src,
							  final float kx,
							  final float ky,
							  final boolean recycle) {
		return skew(src, kx, ky, 0, 0, recycle);
	}

	/**
	 * Return the skewed bitmap.
	 *
	 * @param src The source of bitmap.
	 * @param kx  The skew factor of x.
	 * @param ky  The skew factor of y.
	 * @param px  The x coordinate of the pivot point.
	 * @param py  The y coordinate of the pivot point.
	 * @return the skewed bitmap
	 */
	public static Bitmap skew(final Bitmap src,
							  final float kx,
							  final float ky,
							  final float px,
							  final float py) {
		return skew(src, kx, ky, px, py, false);
	}

	/**
	 * Return the skewed bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param kx      The skew factor of x.
	 * @param ky      The skew factor of y.
	 * @param px      The x coordinate of the pivot point.
	 * @param py      The y coordinate of the pivot point.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the skewed bitmap
	 */
	public static Bitmap skew(final Bitmap src,
							  final float kx,
							  final float ky,
							  final float px,
							  final float py,
							  final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Matrix matrix = new Matrix();
		matrix.setSkew(kx, ky, px, py);
		Bitmap ret = Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), matrix, true);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the rotated bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param degrees The number of degrees.
	 * @param px      The x coordinate of the pivot point.
	 * @param py      The y coordinate of the pivot point.
	 * @return the rotated bitmap
	 */
	public static Bitmap rotate(final Bitmap src,
								final int degrees,
								final float px,
								final float py) {
		return rotate(src, degrees, px, py, false);
	}

	/**
	 * Return the rotated bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param degrees The number of degrees.
	 * @param px      The x coordinate of the pivot point.
	 * @param py      The y coordinate of the pivot point.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the rotated bitmap
	 */
	public static Bitmap rotate(final Bitmap src,
								final int degrees,
								final float px,
								final float py,
								final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		if (degrees == 0) return src;
		Matrix matrix = new Matrix();
		matrix.setRotate(degrees, px, py);
		Bitmap ret = Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), matrix, true);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the rotated degree.
	 *
	 * @param filePath The path of file.
	 * @return the rotated degree
	 */
	public static int getRotateDegree(final String filePath) {
		try {
			ExifInterface exifInterface = new ExifInterface(filePath);
			int orientation = exifInterface.getAttributeInt(
					ExifInterface.TAG_ORIENTATION,
					ExifInterface.ORIENTATION_NORMAL
			);
			switch (orientation) {
				case ExifInterface.ORIENTATION_ROTATE_90:
					return 90;
				case ExifInterface.ORIENTATION_ROTATE_180:
					return 180;
				case ExifInterface.ORIENTATION_ROTATE_270:
					return 270;
				default:
					return 0;
			}
		} catch (IOException e) {
			e.printStackTrace();
			return -1;
		}
	}

	/**
	 * Return the round bitmap.
	 *
	 * @param src The source of bitmap.
	 * @return the round bitmap
	 */
	public static Bitmap toRound(final Bitmap src) {
		return toRound(src, 0, 0, false);
	}

	/**
	 * Return the round bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the round bitmap
	 */
	public static Bitmap toRound(final Bitmap src, final boolean recycle) {
		return toRound(src, 0, 0, recycle);
	}

	/**
	 * Return the round bitmap.
	 *
	 * @param src         The source of bitmap.
	 * @param borderSize  The size of border.
	 * @param borderColor The color of border.
	 * @return the round bitmap
	 */
	public static Bitmap toRound(final Bitmap src,
								 @IntRange(from = 0) int borderSize,
								 @ColorInt int borderColor) {
		return toRound(src, borderSize, borderColor, false);
	}

	/**
	 * Return the round bitmap.
	 *
	 * @param src         The source of bitmap.
	 * @param recycle     True to recycle the source of bitmap, false otherwise.
	 * @param borderSize  The size of border.
	 * @param borderColor The color of border.
	 * @return the round bitmap
	 */
	public static Bitmap toRound(final Bitmap src,
								 @IntRange(from = 0) int borderSize,
								 @ColorInt int borderColor,
								 final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		int width = src.getWidth();
		int height = src.getHeight();
		int size = Math.min(width, height);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		Bitmap ret = Bitmap.createBitmap(width, height, src.getConfig());
		float center = size / 2f;
		RectF rectF = new RectF(0, 0, width, height);
		rectF.inset((width - size) / 2f, (height - size) / 2f);
		Matrix matrix = new Matrix();
		matrix.setTranslate(rectF.left, rectF.top);
		matrix.preScale((float) size / width, (float) size / height);
		BitmapShader shader = new BitmapShader(src, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP);
		shader.setLocalMatrix(matrix);
		paint.setShader(shader);
		Canvas canvas = new Canvas(ret);
		canvas.drawRoundRect(rectF, center, center, paint);
		if (borderSize > 0) {
			paint.setShader(null);
			paint.setColor(borderColor);
			paint.setStyle(Paint.Style.STROKE);
			paint.setStrokeWidth(borderSize);
			float radius = center - borderSize / 2f;
			canvas.drawCircle(width / 2f, height / 2f, radius, paint);
		}
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the round corner bitmap.
	 *
	 * @param src    The source of bitmap.
	 * @param radius The radius of corner.
	 * @return the round corner bitmap
	 */
	public static Bitmap toRoundCorner(final Bitmap src, final float radius) {
		return toRoundCorner(src, radius, 0, 0, false);
	}

	/**
	 * Return the round corner bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param radius  The radius of corner.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the round corner bitmap
	 */
	public static Bitmap toRoundCorner(final Bitmap src,
									   final float radius,
									   final boolean recycle) {
		return toRoundCorner(src, radius, 0, 0, recycle);
	}

	/**
	 * Return the round corner bitmap.
	 *
	 * @param src         The source of bitmap.
	 * @param radius      The radius of corner.
	 * @param borderSize  The size of border.
	 * @param borderColor The color of border.
	 * @return the round corner bitmap
	 */
	public static Bitmap toRoundCorner(final Bitmap src,
									   final float radius,
									   @IntRange(from = 0) int borderSize,
									   @ColorInt int borderColor) {
		return toRoundCorner(src, radius, borderSize, borderColor, false);
	}

	/**
	 * Return the round corner bitmap.
	 *
	 * @param src         The source of bitmap.
	 * @param radius      The radius of corner.
	 * @param borderSize  The size of border.
	 * @param borderColor The color of border.
	 * @param recycle     True to recycle the source of bitmap, false otherwise.
	 * @return the round corner bitmap
	 */
	public static Bitmap toRoundCorner(final Bitmap src,
									   final float radius,
									   @IntRange(from = 0) int borderSize,
									   @ColorInt int borderColor,
									   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		int width = src.getWidth();
		int height = src.getHeight();
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		Bitmap ret = Bitmap.createBitmap(width, height, src.getConfig());
		BitmapShader shader = new BitmapShader(src, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP);
		paint.setShader(shader);
		Canvas canvas = new Canvas(ret);
		RectF rectF = new RectF(0, 0, width, height);
		float halfBorderSize = borderSize / 2f;
		rectF.inset(halfBorderSize, halfBorderSize);
		canvas.drawRoundRect(rectF, radius, radius, paint);
		if (borderSize > 0) {
			paint.setShader(null);
			paint.setColor(borderColor);
			paint.setStyle(Paint.Style.STROKE);
			paint.setStrokeWidth(borderSize);
			paint.setStrokeCap(Paint.Cap.ROUND);
			canvas.drawRoundRect(rectF, radius, radius, paint);
		}
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the round corner bitmap with border.
	 *
	 * @param src          The source of bitmap.
	 * @param borderSize   The size of border.
	 * @param color        The color of border.
	 * @param cornerRadius The radius of corner.
	 * @return the round corner bitmap with border
	 */
	public static Bitmap addCornerBorder(final Bitmap src,
										 @IntRange(from = 1) final int borderSize,
										 @ColorInt final int color,
										 @FloatRange(from = 0) final float cornerRadius) {
		return addBorder(src, borderSize, color, false, cornerRadius, false);
	}

	/**
	 * Return the round corner bitmap with border.
	 *
	 * @param src          The source of bitmap.
	 * @param borderSize   The size of border.
	 * @param color        The color of border.
	 * @param cornerRadius The radius of corner.
	 * @param recycle      True to recycle the source of bitmap, false otherwise.
	 * @return the round corner bitmap with border
	 */
	public static Bitmap addCornerBorder(final Bitmap src,
										 @IntRange(from = 1) final int borderSize,
										 @ColorInt final int color,
										 @FloatRange(from = 0) final float cornerRadius,
										 final boolean recycle) {
		return addBorder(src, borderSize, color, false, cornerRadius, recycle);
	}

	/**
	 * Return the round bitmap with border.
	 *
	 * @param src        The source of bitmap.
	 * @param borderSize The size of border.
	 * @param color      The color of border.
	 * @return the round bitmap with border
	 */
	public static Bitmap addCircleBorder(final Bitmap src,
										 @IntRange(from = 1) final int borderSize,
										 @ColorInt final int color) {
		return addBorder(src, borderSize, color, true, 0, false);
	}

	/**
	 * Return the round bitmap with border.
	 *
	 * @param src        The source of bitmap.
	 * @param borderSize The size of border.
	 * @param color      The color of border.
	 * @param recycle    True to recycle the source of bitmap, false otherwise.
	 * @return the round bitmap with border
	 */
	public static Bitmap addCircleBorder(final Bitmap src,
										 @IntRange(from = 1) final int borderSize,
										 @ColorInt final int color,
										 final boolean recycle) {
		return addBorder(src, borderSize, color, true, 0, recycle);
	}

	/**
	 * Return the bitmap with border.
	 *
	 * @param src          The source of bitmap.
	 * @param borderSize   The size of border.
	 * @param color        The color of border.
	 * @param isCircle     True to draw circle, false to draw corner.
	 * @param cornerRadius The radius of corner.
	 * @param recycle      True to recycle the source of bitmap, false otherwise.
	 * @return the bitmap with border
	 */
	private static Bitmap addBorder(final Bitmap src,
									@IntRange(from = 1) final int borderSize,
									@ColorInt final int color,
									final boolean isCircle,
									final float cornerRadius,
									final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = recycle ? src : src.copy(src.getConfig(), true);
		int width = ret.getWidth();
		int height = ret.getHeight();
		Canvas canvas = new Canvas(ret);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		paint.setColor(color);
		paint.setStyle(Paint.Style.STROKE);
		paint.setStrokeWidth(borderSize);
		if (isCircle) {
			float radius = Math.min(width, height) / 2f - borderSize / 2f;
			canvas.drawCircle(width / 2f, height / 2f, radius, paint);
		} else {
			int halfBorderSize = borderSize >> 1;
			RectF rectF = new RectF(halfBorderSize, halfBorderSize,
					width - halfBorderSize, height - halfBorderSize);
			canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, paint);
		}
		return ret;
	}

	/**
	 * Return the bitmap with reflection.
	 *
	 * @param src              The source of bitmap.
	 * @param reflectionHeight The height of reflection.
	 * @return the bitmap with reflection
	 */
	public static Bitmap addReflection(final Bitmap src, final int reflectionHeight) {
		return addReflection(src, reflectionHeight, false);
	}

	/**
	 * Return the bitmap with reflection.
	 *
	 * @param src              The source of bitmap.
	 * @param reflectionHeight The height of reflection.
	 * @param recycle          True to recycle the source of bitmap, false otherwise.
	 * @return the bitmap with reflection
	 */
	public static Bitmap addReflection(final Bitmap src,
									   final int reflectionHeight,
									   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		final int REFLECTION_GAP = 0;
		int srcWidth = src.getWidth();
		int srcHeight = src.getHeight();
		Matrix matrix = new Matrix();
		matrix.preScale(1, -1);
		Bitmap reflectionBitmap = Bitmap.createBitmap(src, 0, srcHeight - reflectionHeight,
				srcWidth, reflectionHeight, matrix, false);
		Bitmap ret = Bitmap.createBitmap(srcWidth, srcHeight + reflectionHeight, src.getConfig());
		Canvas canvas = new Canvas(ret);
		canvas.drawBitmap(src, 0, 0, null);
		canvas.drawBitmap(reflectionBitmap, 0, srcHeight + REFLECTION_GAP, null);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		LinearGradient shader = new LinearGradient(
				0, srcHeight,
				0, ret.getHeight() + REFLECTION_GAP,
				0x70FFFFFF,
				0x00FFFFFF,
				Shader.TileMode.MIRROR);
		paint.setShader(shader);
		paint.setXfermode(new PorterDuffXfermode(android.graphics.PorterDuff.Mode.DST_IN));
		canvas.drawRect(0, srcHeight + REFLECTION_GAP, srcWidth, ret.getHeight(), paint);
		if (!reflectionBitmap.isRecycled()) reflectionBitmap.recycle();
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the bitmap with text watermarking.
	 *
	 * @param src      The source of bitmap.
	 * @param content  The content of text.
	 * @param textSize The size of text.
	 * @param color    The color of text.
	 * @param x        The x coordinate of the first pixel.
	 * @param y        The y coordinate of the first pixel.
	 * @return the bitmap with text watermarking
	 */
	public static Bitmap addTextWatermark(final Bitmap src,
										  final String content,
										  final int textSize,
										  @ColorInt final int color,
										  final float x,
										  final float y) {
		return addTextWatermark(src, content, textSize, color, x, y, false);
	}

	/**
	 * Return the bitmap with text watermarking.
	 *
	 * @param src      The source of bitmap.
	 * @param content  The content of text.
	 * @param textSize The size of text.
	 * @param color    The color of text.
	 * @param x        The x coordinate of the first pixel.
	 * @param y        The y coordinate of the first pixel.
	 * @param recycle  True to recycle the source of bitmap, false otherwise.
	 * @return the bitmap with text watermarking
	 */
	public static Bitmap addTextWatermark(final Bitmap src,
										  final String content,
										  final float textSize,
										  @ColorInt final int color,
										  final float x,
										  final float y,
										  final boolean recycle) {
		if (isEmptyBitmap(src) || content == null) return null;
		Bitmap ret = src.copy(src.getConfig(), true);
		Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
		Canvas canvas = new Canvas(ret);
		paint.setColor(color);
		paint.setTextSize(textSize);
		Rect bounds = new Rect();
		paint.getTextBounds(content, 0, content.length(), bounds);
		canvas.drawText(content, x, y + textSize, paint);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the bitmap with image watermarking.
	 *
	 * @param src       The source of bitmap.
	 * @param watermark The image watermarking.
	 * @param x         The x coordinate of the first pixel.
	 * @param y         The y coordinate of the first pixel.
	 * @param alpha     The alpha of watermark.
	 * @return the bitmap with image watermarking
	 */
	public static Bitmap addImageWatermark(final Bitmap src,
										   final Bitmap watermark,
										   final int x, final int y,
										   final int alpha) {
		return addImageWatermark(src, watermark, x, y, alpha, false);
	}

	/**
	 * Return the bitmap with image watermarking.
	 *
	 * @param src       The source of bitmap.
	 * @param watermark The image watermarking.
	 * @param x         The x coordinate of the first pixel.
	 * @param y         The y coordinate of the first pixel.
	 * @param alpha     The alpha of watermark.
	 * @param recycle   True to recycle the source of bitmap, false otherwise.
	 * @return the bitmap with image watermarking
	 */
	public static Bitmap addImageWatermark(final Bitmap src,
										   final Bitmap watermark,
										   final int x,
										   final int y,
										   final int alpha,
										   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = src.copy(src.getConfig(), true);
		if (!isEmptyBitmap(watermark)) {
			Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
			Canvas canvas = new Canvas(ret);
			paint.setAlpha(alpha);
			canvas.drawBitmap(watermark, x, y, paint);
		}
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the alpha bitmap.
	 *
	 * @param src The source of bitmap.
	 * @return the alpha bitmap
	 */
	public static Bitmap toAlpha(final Bitmap src) {
		return toAlpha(src, false);
	}

	/**
	 * Return the alpha bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the alpha bitmap
	 */
	public static Bitmap toAlpha(final Bitmap src, final Boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = src.extractAlpha();
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the gray bitmap.
	 *
	 * @param src The source of bitmap.
	 * @return the gray bitmap
	 */
	public static Bitmap toGray(final Bitmap src) {
		return toGray(src, false);
	}

	/**
	 * Return the gray bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the gray bitmap
	 */
	public static Bitmap toGray(final Bitmap src, final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		Bitmap ret = Bitmap.createBitmap(src.getWidth(), src.getHeight(), src.getConfig());
		Canvas canvas = new Canvas(ret);
		Paint paint = new Paint();
		ColorMatrix colorMatrix = new ColorMatrix();
		colorMatrix.setSaturation(0);
		ColorMatrixColorFilter colorMatrixColorFilter = new ColorMatrixColorFilter(colorMatrix);
		paint.setColorFilter(colorMatrixColorFilter);
		canvas.drawBitmap(src, 0, 0, paint);
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the blur bitmap fast.
	 * <p>zoom out, blur, zoom in</p>
	 *
	 * @param src    The source of bitmap.
	 * @param scale  The scale(0...1).
	 * @param radius The radius(0...25).
	 * @return the blur bitmap
	 */
	public static Bitmap fastBlur(final Bitmap src,
								  @FloatRange(
										  from = 0, to = 1, fromInclusive = false
								  ) final float scale,
								  @FloatRange(
										  from = 0, to = 25, fromInclusive = false
								  ) final float radius) {
		return fastBlur(src, scale, radius, false);
	}

	/**
	 * Return the blur bitmap fast.
	 * <p>zoom out, blur, zoom in</p>
	 *
	 * @param src     The source of bitmap.
	 * @param scale   The scale(0...1).
	 * @param radius  The radius(0...25).
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the blur bitmap
	 */
	public static Bitmap fastBlur(final Bitmap src,
								  @FloatRange(
										  from = 0, to = 1, fromInclusive = false
								  ) final float scale,
								  @FloatRange(
										  from = 0, to = 25, fromInclusive = false
								  ) final float radius,
								  final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		int width = src.getWidth();
		int height = src.getHeight();
		Matrix matrix = new Matrix();
		matrix.setScale(scale, scale);
		Bitmap scaleBitmap =
				Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), matrix, true);
		Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG | Paint.ANTI_ALIAS_FLAG);
		Canvas canvas = new Canvas();
		PorterDuffColorFilter filter = new PorterDuffColorFilter(
				Color.TRANSPARENT, PorterDuff.Mode.SRC_ATOP);
		paint.setColorFilter(filter);
		canvas.scale(scale, scale);
		canvas.drawBitmap(scaleBitmap, 0, 0, paint);
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
			scaleBitmap = renderScriptBlur(scaleBitmap, radius, recycle);
		} else {
			scaleBitmap = stackBlur(scaleBitmap, (int) radius, recycle);
		}
		if (scale == 1) {
			if (recycle && !src.isRecycled()) src.recycle();
			return scaleBitmap;
		}
		Bitmap ret = Bitmap.createScaledBitmap(scaleBitmap, width, height, true);
		if (!scaleBitmap.isRecycled()) scaleBitmap.recycle();
		if (recycle && !src.isRecycled()) src.recycle();
		return ret;
	}

	/**
	 * Return the blur bitmap using render script.
	 *
	 * @param src    The source of bitmap.
	 * @param radius The radius(0...25).
	 * @return the blur bitmap
	 */
	@RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
	public static Bitmap renderScriptBlur(final Bitmap src,
										  @FloatRange(
												  from = 0, to = 25, fromInclusive = false
										  ) final float radius) {
		return renderScriptBlur(src, radius, false);
	}

	/**
	 * Return the blur bitmap using render script.
	 *
	 * @param src     The source of bitmap.
	 * @param radius  The radius(0...25).
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the blur bitmap
	 */
	@RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
	public static Bitmap renderScriptBlur(final Bitmap src,
										  @FloatRange(
												  from = 0, to = 25, fromInclusive = false
										  ) final float radius,
										  final boolean recycle) {
		RenderScript rs = null;
		Bitmap ret = recycle ? src : src.copy(src.getConfig(), true);
		try {
			rs = RenderScript.create(Utils.getApp());
			rs.setMessageHandler(new RenderScript.RSMessageHandler());
			Allocation input = Allocation.createFromBitmap(rs,
					ret,
					Allocation.MipmapControl.MIPMAP_NONE,
					Allocation.USAGE_SCRIPT);
			Allocation output = Allocation.createTyped(rs, input.getType());
			ScriptIntrinsicBlur blurScript = ScriptIntrinsicBlur.create(rs, Element.U8_4(rs));
			blurScript.setInput(input);
			blurScript.setRadius(radius);
			blurScript.forEach(output);
			output.copyTo(ret);
		} finally {
			if (rs != null) {
				rs.destroy();
			}
		}
		return ret;
	}

	/**
	 * Return the blur bitmap using stack.
	 *
	 * @param src    The source of bitmap.
	 * @param radius The radius(0...25).
	 * @return the blur bitmap
	 */
	public static Bitmap stackBlur(final Bitmap src, final int radius) {
		return stackBlur(src, radius, false);
	}

	/**
	 * Return the blur bitmap using stack.
	 *
	 * @param src     The source of bitmap.
	 * @param radius  The radius(0...25).
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the blur bitmap
	 */
	public static Bitmap stackBlur(final Bitmap src, int radius, final boolean recycle) {
		Bitmap ret = recycle ? src : src.copy(src.getConfig(), true);
		if (radius < 1) {
			radius = 1;
		}
		int w = ret.getWidth();
		int h = ret.getHeight();

		int[] pix = new int[w * h];
		ret.getPixels(pix, 0, w, 0, 0, w, h);

		int wm = w - 1;
		int hm = h - 1;
		int wh = w * h;
		int div = radius + radius + 1;

		int r[] = new int[wh];
		int g[] = new int[wh];
		int b[] = new int[wh];
		int rsum, gsum, bsum, x, y, i, p, yp, yi, yw;
		int vmin[] = new int[Math.max(w, h)];

		int divsum = (div + 1) >> 1;
		divsum *= divsum;
		int dv[] = new int[256 * divsum];
		for (i = 0; i < 256 * divsum; i++) {
			dv[i] = (i / divsum);
		}

		yw = yi = 0;

		int[][] stack = new int[div][3];
		int stackpointer;
		int stackstart;
		int[] sir;
		int rbs;
		int r1 = radius + 1;
		int routsum, goutsum, boutsum;
		int rinsum, ginsum, binsum;

		for (y = 0; y < h; y++) {
			rinsum = ginsum = binsum = routsum = goutsum = boutsum = rsum = gsum = bsum = 0;
			for (i = -radius; i <= radius; i++) {
				p = pix[yi + Math.min(wm, Math.max(i, 0))];
				sir = stack[i + radius];
				sir[0] = (p & 0xff0000) >> 16;
				sir[1] = (p & 0x00ff00) >> 8;
				sir[2] = (p & 0x0000ff);
				rbs = r1 - Math.abs(i);
				rsum += sir[0] * rbs;
				gsum += sir[1] * rbs;
				bsum += sir[2] * rbs;
				if (i > 0) {
					rinsum += sir[0];
					ginsum += sir[1];
					binsum += sir[2];
				} else {
					routsum += sir[0];
					goutsum += sir[1];
					boutsum += sir[2];
				}
			}
			stackpointer = radius;

			for (x = 0; x < w; x++) {

				r[yi] = dv[rsum];
				g[yi] = dv[gsum];
				b[yi] = dv[bsum];

				rsum -= routsum;
				gsum -= goutsum;
				bsum -= boutsum;

				stackstart = stackpointer - radius + div;
				sir = stack[stackstart % div];

				routsum -= sir[0];
				goutsum -= sir[1];
				boutsum -= sir[2];

				if (y == 0) {
					vmin[x] = Math.min(x + radius + 1, wm);
				}
				p = pix[yw + vmin[x]];

				sir[0] = (p & 0xff0000) >> 16;
				sir[1] = (p & 0x00ff00) >> 8;
				sir[2] = (p & 0x0000ff);

				rinsum += sir[0];
				ginsum += sir[1];
				binsum += sir[2];

				rsum += rinsum;
				gsum += ginsum;
				bsum += binsum;

				stackpointer = (stackpointer + 1) % div;
				sir = stack[(stackpointer) % div];

				routsum += sir[0];
				goutsum += sir[1];
				boutsum += sir[2];

				rinsum -= sir[0];
				ginsum -= sir[1];
				binsum -= sir[2];

				yi++;
			}
			yw += w;
		}
		for (x = 0; x < w; x++) {
			rinsum = ginsum = binsum = routsum = goutsum = boutsum = rsum = gsum = bsum = 0;
			yp = -radius * w;
			for (i = -radius; i <= radius; i++) {
				yi = Math.max(0, yp) + x;

				sir = stack[i + radius];

				sir[0] = r[yi];
				sir[1] = g[yi];
				sir[2] = b[yi];

				rbs = r1 - Math.abs(i);

				rsum += r[yi] * rbs;
				gsum += g[yi] * rbs;
				bsum += b[yi] * rbs;

				if (i > 0) {
					rinsum += sir[0];
					ginsum += sir[1];
					binsum += sir[2];
				} else {
					routsum += sir[0];
					goutsum += sir[1];
					boutsum += sir[2];
				}

				if (i < hm) {
					yp += w;
				}
			}
			yi = x;
			stackpointer = radius;
			for (y = 0; y < h; y++) {
				// Preserve alpha channel: ( 0xff000000 & pix[yi] )
				pix[yi] = (0xff000000 & pix[yi]) | (dv[rsum] << 16) | (dv[gsum] << 8) | dv[bsum];

				rsum -= routsum;
				gsum -= goutsum;
				bsum -= boutsum;

				stackstart = stackpointer - radius + div;
				sir = stack[stackstart % div];

				routsum -= sir[0];
				goutsum -= sir[1];
				boutsum -= sir[2];

				if (x == 0) {
					vmin[y] = Math.min(y + r1, hm) * w;
				}
				p = x + vmin[y];

				sir[0] = r[p];
				sir[1] = g[p];
				sir[2] = b[p];

				rinsum += sir[0];
				ginsum += sir[1];
				binsum += sir[2];

				rsum += rinsum;
				gsum += ginsum;
				bsum += binsum;

				stackpointer = (stackpointer + 1) % div;
				sir = stack[stackpointer];

				routsum += sir[0];
				goutsum += sir[1];
				boutsum += sir[2];

				rinsum -= sir[0];
				ginsum -= sir[1];
				binsum -= sir[2];

				yi += w;
			}
		}
		ret.setPixels(pix, 0, w, 0, 0, w, h);
		return ret;
	}

	/**
	 * Save the bitmap.
	 *
	 * @param src      The source of bitmap.
	 * @param filePath The path of file.
	 * @param format   The format of the image.
	 * @return {@code true}: success<br>{@code false}: fail
	 */
	public static boolean save(final Bitmap src,
							   final String filePath,
							   final Bitmap.CompressFormat format) {
		return save(src, getFileByPath(filePath), format, false);
	}

	/**
	 * Save the bitmap.
	 *
	 * @param src    The source of bitmap.
	 * @param file   The file.
	 * @param format The format of the image.
	 * @return {@code true}: success<br>{@code false}: fail
	 */
	public static boolean save(final Bitmap src, final File file, final Bitmap.CompressFormat format) {
		return save(src, file, format, false);
	}

	/**
	 * Save the bitmap.
	 *
	 * @param src      The source of bitmap.
	 * @param filePath The path of file.
	 * @param format   The format of the image.
	 * @param recycle  True to recycle the source of bitmap, false otherwise.
	 * @return {@code true}: success<br>{@code false}: fail
	 */
	public static boolean save(final Bitmap src,
							   final String filePath,
							   final Bitmap.CompressFormat format,
							   final boolean recycle) {
		return save(src, getFileByPath(filePath), format, recycle);
	}

	/**
	 * Save the bitmap.
	 *
	 * @param src     The source of bitmap.
	 * @param file    The file.
	 * @param format  The format of the image.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return {@code true}: success<br>{@code false}: fail
	 */
	public static boolean save(final Bitmap src,
							   final File file,
							   final Bitmap.CompressFormat format,
							   final boolean recycle) {
		if (isEmptyBitmap(src) || !createFileByDeleteOldFile(file)) return false;
		OutputStream os = null;
		boolean ret = false;
		try {
			os = new BufferedOutputStream(new FileOutputStream(file));
			ret = src.compress(format, 100, os);
			if (recycle && !src.isRecycled()) src.recycle();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (os != null) {
					os.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return ret;
	}

	/**
	 * Return whether it is a image according to the file name.
	 *
	 * @param file The file.
	 * @return {@code true}: yes<br>{@code false}: no
	 */
	public static boolean isImage(final File file) {
		return file != null && isImage(file.getPath());
	}

	/**
	 * Return whether it is a image according to the file name.
	 *
	 * @param filePath The path of file.
	 * @return {@code true}: yes<br>{@code false}: no
	 */
	public static boolean isImage(final String filePath) {
		String path = filePath.toUpperCase();
		return path.endsWith(".PNG") || path.endsWith(".JPG")
				|| path.endsWith(".JPEG") || path.endsWith(".BMP")
				|| path.endsWith(".GIF") || path.endsWith(".WEBP");
	}

	/**
	 * Return the type of image.
	 *
	 * @param filePath The path of file.
	 * @return the type of image
	 */
	public static String getImageType(final String filePath) {
		return getImageType(getFileByPath(filePath));
	}

	/**
	 * Return the type of image.
	 *
	 * @param file The file.
	 * @return the type of image
	 */
	public static String getImageType(final File file) {
		if (file == null) return "";
		InputStream is = null;
		try {
			is = new FileInputStream(file);
			String type = getImageType(is);
			if (type != null) {
				return type;
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (is != null) {
					is.close();
				}
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return getFileExtension(file.getAbsolutePath()).toUpperCase();
	}

	private static String getFileExtension(final String filePath) {
		if (isSpace(filePath)) return filePath;
		int lastPoi = filePath.lastIndexOf('.');
		int lastSep = filePath.lastIndexOf(File.separator);
		if (lastPoi == -1 || lastSep >= lastPoi) return "";
		return filePath.substring(lastPoi + 1);
	}

	private static String getImageType(final InputStream is) {
		if (is == null) return null;
		try {
			byte[] bytes = new byte[8];
			return is.read(bytes, 0, 8) != -1 ? getImageType(bytes) : null;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	private static String getImageType(final byte[] bytes) {
		if (isJPEG(bytes)) return "JPEG";
		if (isGIF(bytes)) return "GIF";
		if (isPNG(bytes)) return "PNG";
		if (isBMP(bytes)) return "BMP";
		return null;
	}

	private static boolean isJPEG(final byte[] b) {
		return b.length >= 2
				&& (b[0] == (byte) 0xFF) && (b[1] == (byte) 0xD8);
	}

	private static boolean isGIF(final byte[] b) {
		return b.length >= 6
				&& b[0] == 'G' && b[1] == 'I'
				&& b[2] == 'F' && b[3] == '8'
				&& (b[4] == '7' || b[4] == '9') && b[5] == 'a';
	}

	private static boolean isPNG(final byte[] b) {
		return b.length >= 8
				&& (b[0] == (byte) 137 && b[1] == (byte) 80
				&& b[2] == (byte) 78 && b[3] == (byte) 71
				&& b[4] == (byte) 13 && b[5] == (byte) 10
				&& b[6] == (byte) 26 && b[7] == (byte) 10);
	}

	private static boolean isBMP(final byte[] b) {
		return b.length >= 2
				&& (b[0] == 0x42) && (b[1] == 0x4d);
	}

	private static boolean isEmptyBitmap(final Bitmap src) {
		return src == null || src.getWidth() == 0 || src.getHeight() == 0;
	}

	///////////////////////////////////////////////////////////////////////////
	// about compress
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Return the compressed bitmap using scale.
	 *
	 * @param src       The source of bitmap.
	 * @param newWidth  The new width.
	 * @param newHeight The new height.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByScale(final Bitmap src,
										 final int newWidth,
										 final int newHeight) {
		return scale(src, newWidth, newHeight, false);
	}

	/**
	 * Return the compressed bitmap using scale.
	 *
	 * @param src       The source of bitmap.
	 * @param newWidth  The new width.
	 * @param newHeight The new height.
	 * @param recycle   True to recycle the source of bitmap, false otherwise.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByScale(final Bitmap src,
										 final int newWidth,
										 final int newHeight,
										 final boolean recycle) {
		return scale(src, newWidth, newHeight, recycle);
	}

	/**
	 * Return the compressed bitmap using scale.
	 *
	 * @param src         The source of bitmap.
	 * @param scaleWidth  The scale of width.
	 * @param scaleHeight The scale of height.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByScale(final Bitmap src,
										 final float scaleWidth,
										 final float scaleHeight) {
		return scale(src, scaleWidth, scaleHeight, false);
	}

	/**
	 * Return the compressed bitmap using scale.
	 *
	 * @param src         The source of bitmap.
	 * @param scaleWidth  The scale of width.
	 * @param scaleHeight The scale of height.
	 * @param recycle     True to recycle the source of bitmap, false otherwise.
	 * @return he compressed bitmap
	 */
	public static Bitmap compressByScale(final Bitmap src,
										 final float scaleWidth,
										 final float scaleHeight,
										 final boolean recycle) {
		return scale(src, scaleWidth, scaleHeight, recycle);
	}

	/**
	 * Return the compressed bitmap using quality.
	 *
	 * @param src     The source of bitmap.
	 * @param quality The quality.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByQuality(final Bitmap src,
										   @IntRange(from = 0, to = 100) final int quality) {
		return compressByQuality(src, quality, false);
	}

	/**
	 * Return the compressed bitmap using quality.
	 *
	 * @param src     The source of bitmap.
	 * @param quality The quality.
	 * @param recycle True to recycle the source of bitmap, false otherwise.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByQuality(final Bitmap src,
										   @IntRange(from = 0, to = 100) final int quality,
										   final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		src.compress(Bitmap.CompressFormat.JPEG, quality, baos);
		byte[] bytes = baos.toByteArray();
		if (recycle && !src.isRecycled()) src.recycle();
		return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
	}

	/**
	 * Return the compressed bitmap using quality.
	 *
	 * @param src         The source of bitmap.
	 * @param maxByteSize The maximum size of byte.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByQuality(final Bitmap src, final long maxByteSize) {
		return compressByQuality(src, maxByteSize, false);
	}

	/**
	 * Return the compressed bitmap using quality.
	 *
	 * @param src         The source of bitmap.
	 * @param maxByteSize The maximum size of byte.
	 * @param recycle     True to recycle the source of bitmap, false otherwise.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressByQuality(final Bitmap src,
										   final long maxByteSize,
										   final boolean recycle) {
		if (isEmptyBitmap(src) || maxByteSize <= 0) return null;
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		src.compress(Bitmap.CompressFormat.JPEG, 100, baos);
		byte[] bytes;
		if (baos.size() <= maxByteSize) {
			bytes = baos.toByteArray();
		} else {
			baos.reset();
			src.compress(Bitmap.CompressFormat.JPEG, 0, baos);
			if (baos.size() >= maxByteSize) {
				bytes = baos.toByteArray();
			} else {
				// find the best quality using binary search
				int st = 0;
				int end = 100;
				int mid = 0;
				while (st < end) {
					mid = (st + end) / 2;
					baos.reset();
					src.compress(Bitmap.CompressFormat.JPEG, mid, baos);
					int len = baos.size();
					if (len == maxByteSize) {
						break;
					} else if (len > maxByteSize) {
						end = mid - 1;
					} else {
						st = mid + 1;
					}
				}
				if (end == mid - 1) {
					baos.reset();
					src.compress(Bitmap.CompressFormat.JPEG, st, baos);
				}
				bytes = baos.toByteArray();
			}
		}
		if (recycle && !src.isRecycled()) src.recycle();
		return BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
	}

	/**
	 * Return the compressed bitmap using sample size.
	 *
	 * @param src        The source of bitmap.
	 * @param sampleSize The sample size.
	 * @return the compressed bitmap
	 */

	public static Bitmap compressBySampleSize(final Bitmap src, final int sampleSize) {
		return compressBySampleSize(src, sampleSize, false);
	}

	/**
	 * Return the compressed bitmap using sample size.
	 *
	 * @param src        The source of bitmap.
	 * @param sampleSize The sample size.
	 * @param recycle    True to recycle the source of bitmap, false otherwise.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressBySampleSize(final Bitmap src,
											  final int sampleSize,
											  final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inSampleSize = sampleSize;
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		src.compress(Bitmap.CompressFormat.JPEG, 100, baos);
		byte[] bytes = baos.toByteArray();
		if (recycle && !src.isRecycled()) src.recycle();
		return BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
	}

	/**
	 * Return the compressed bitmap using sample size.
	 *
	 * @param src       The source of bitmap.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressBySampleSize(final Bitmap src,
											  final int maxWidth,
											  final int maxHeight) {
		return compressBySampleSize(src, maxWidth, maxHeight, false);
	}

	/**
	 * Return the compressed bitmap using sample size.
	 *
	 * @param src       The source of bitmap.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @param recycle   True to recycle the source of bitmap, false otherwise.
	 * @return the compressed bitmap
	 */
	public static Bitmap compressBySampleSize(final Bitmap src,
											  final int maxWidth,
											  final int maxHeight,
											  final boolean recycle) {
		if (isEmptyBitmap(src)) return null;
		BitmapFactory.Options options = new BitmapFactory.Options();
		options.inJustDecodeBounds = true;
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		src.compress(Bitmap.CompressFormat.JPEG, 100, baos);
		byte[] bytes = baos.toByteArray();
		BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
		options.inSampleSize = calculateInSampleSize(options, maxWidth, maxHeight);
		options.inJustDecodeBounds = false;
		if (recycle && !src.isRecycled()) src.recycle();
		return BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
	}

	private static File getFileByPath(final String filePath) {
		return isSpace(filePath) ? null : new File(filePath);
	}

	private static boolean createFileByDeleteOldFile(final File file) {
		if (file == null) return false;
		if (file.exists() && !file.delete()) return false;
		if (!createOrExistsDir(file.getParentFile())) return false;
		try {
			return file.createNewFile();
		} catch (IOException e) {
			e.printStackTrace();
			return false;
		}
	}

	private static boolean createOrExistsDir(final File file) {
		return file != null && (file.exists() ? file.isDirectory() : file.mkdirs());
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

	/**
	 * Return the sample size.
	 *
	 * @param options   The options.
	 * @param maxWidth  The maximum width.
	 * @param maxHeight The maximum height.
	 * @return the sample size
	 */
	private static int calculateInSampleSize(final BitmapFactory.Options options,
											 final int maxWidth,
											 final int maxHeight) {
		int height = options.outHeight;
		int width = options.outWidth;
		int inSampleSize = 1;
		while ((width >>= 1) >= maxWidth && (height >>= 1) >= maxHeight) {
			inSampleSize <<= 1;
		}
		return inSampleSize;
	}

	private static byte[] input2Byte(final InputStream is) {
		if (is == null) return null;
		try {
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			byte[] b = new byte[MemoryConstants.KB];
			int len;
			while ((len = is.read(b, 0, MemoryConstants.KB)) != -1) {
				os.write(b, 0, len);
			}
			return os.toByteArray();
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		} finally {
			try {
				is.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

}
