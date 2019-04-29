package com.androidcodelibs.androidutilslib.view.swiperefresh;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Animatable;
import android.graphics.drawable.Drawable;
import android.support.annotation.NonNull;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.DecelerateInterpolator;
import android.view.animation.Interpolator;
import android.view.animation.Transformation;

import com.androidcodelibs.androidutilslib.utils.ViewUtils;

import java.util.ArrayList;


public class SmileProgressDrawable extends Drawable implements Animatable {

    private static final Interpolator TIME_INTERPOLATOR = new DecelerateInterpolator();

    private static final float COLOR_START_DELAY_OFFSET = 0.75f;
    private Animation mAnimation;

    public void setColorSchemeColors(int[] colors) {
        mSmile.setColors(colors);
        mSmile.setColorIndex(0);
    }

    // Maps to ProgressBar.Large style
    static final int LARGE = 0;
    // Maps to ProgressBar default style
    static final int DEFAULT = 1;

    public  int getAnimationDuration() {
        return animationDuration;
    }

    public  void setAnimationDuration(int animationDuration) {
        this.animationDuration = animationDuration;
    }

    /**
     * The duration of a single progress spin in milliseconds.
     */
    private int animationDuration = 2332;

    public float mRotationCount;

    /**
     * The number of points in the progress "star".
     */
    private static final float NUM_POINTS = 5f;
    /**
     * The list of animators operating on this drawable.
     */
    private final ArrayList<Animation> mAnimators = new ArrayList<Animation>();

    /**
     * The indicator ring, used to manage animation state.
     */
    private final Smile mSmile;

    /**
     * Canvas rotation in degrees.
     */
    private float mRotation = 0;

    private View mParent;


    public SmileProgressDrawable(Context context, View parent) {
        mParent = parent;
        mSmile = new Smile(context,mCallback);
        setupAnimators();
    }

    private void setupAnimators() {
        final Animation animation = new Animation() {
            @Override
            public void applyTransformation(float interpolatedTime, Transformation t) {
                updateRingColor(interpolatedTime, mSmile);
                mSmile.setAnimatedValue(interpolatedTime);
            }
        };
        animation.setRepeatCount(Animation.INFINITE);
        animation.setRepeatMode(Animation.RESTART);
        animation.setInterpolator(TIME_INTERPOLATOR);
        animation.setAnimationListener(new Animation.AnimationListener() {


            @Override
            public void onAnimationStart(Animation animation) {
                mRotationCount = 0;
            }

            @Override
            public void onAnimationEnd(Animation animation) {
                // do nothing
            }

            @Override
            public void onAnimationRepeat(Animation animation) {
                mSmile.goToNextColor();

                mRotationCount = (mRotationCount + 1) % (NUM_POINTS);
            }
        });

        mAnimation = animation;
    }


    public void setInterpolator(Interpolator interpolator){
        mAnimation.setInterpolator(interpolator);
    }
    @Override
    public void start() {
        mAnimation.setDuration(animationDuration);
        mParent.startAnimation(mAnimation);

    }

    @Override
    public void stop() {
        mParent.clearAnimation();
        mSmile.setColorIndex(0);
        mSmile.setAnimatedValue(0);

    }

    @Override
    public boolean isRunning() {
        final ArrayList<Animation> animators = mAnimators;
        final int N = animators.size();
        for (int i = 0; i < N; i++) {
            final Animation animator = animators.get(i);
            if (animator.hasStarted() && !animator.hasEnded()) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void draw(Canvas canvas) {
        final Rect bounds = getBounds();
        final int saveCount = canvas.save();
        canvas.rotate(mRotation, bounds.exactCenterX(), bounds.exactCenterY());
        mSmile.draw(canvas, bounds);
        canvas.restoreToCount(saveCount);
    }

    @Override
    public void setAlpha(int alpha) {

    }

    @Override
    public void setColorFilter(ColorFilter colorFilter) {

    }

    public int getAlpha() {
        return mSmile.getAlpha();
    }


    @Override
    public int getOpacity() {
        return PixelFormat.UNKNOWN;
    }

    public void setPercentage(float v) {
        mSmile.setAnimatedValue(v);
    }


    @SuppressWarnings("unused")
    private float getRotation() {
        return mRotation;
    }

    void updateRingColor(float interpolatedTime, Smile smile) {
        if (interpolatedTime > COLOR_START_DELAY_OFFSET) {
            int color = evaluateColorChange((interpolatedTime - COLOR_START_DELAY_OFFSET)
                            / (1.0f - COLOR_START_DELAY_OFFSET), smile.getStartingColor(),
                    smile.getNextColor());
            smile.setColor(color);
        }
    }

    // Adapted from ArgbEvaluator.java
    private int evaluateColorChange(float fraction, int startValue, int endValue) {
        int startInt = (Integer) startValue;
        int startA = (startInt >> 24) & 0xff;
        int startR = (startInt >> 16) & 0xff;
        int startG = (startInt >> 8) & 0xff;
        int startB = startInt & 0xff;

        int endInt = (Integer) endValue;
        int endA = (endInt >> 24) & 0xff;
        int endR = (endInt >> 16) & 0xff;
        int endG = (endInt >> 8) & 0xff;
        int endB = endInt & 0xff;

        return (int) ((startA + (int) (fraction * (endA - startA))) << 24)
                | (int) ((startR + (int) (fraction * (endR - startR))) << 16)
                | (int) ((startG + (int) (fraction * (endG - startG))) << 8)
                | (int) ((startB + (int) (fraction * (endB - startB))));
    }


    public void setStrokeWidth(float strokeWidth) {
        mSmile.setStrokeWidth(strokeWidth);
    }


    private static class Smile {
        private final RectF mTempBounds = new RectF();
        private final Paint mPaint = new Paint();
        private final Callback mCallback;

        private int[] mColors = {
                Color.GRAY
        };

        private int mColorIndex = 0;
        private int mCurrentColor = mColors[0];

        public static final float ANIMATED_VALUE_MAX = 855;
        private int mUsedValue;

        public int getAnimatedValue() {
            return animatedValue;
        }

        int animatedValue;
        private float mStrokeWidth;
        private int mAlpha;

        public Smile(Context context,Callback callback) {
            this.mCallback = callback;
            mPaint.setStyle(Paint.Style.STROKE); // 画笔类型
            mPaint.setAntiAlias(true); // 抗锯齿
            mPaint.setStrokeCap(Paint.Cap.ROUND);//圆角笔触
            mStrokeWidth = ViewUtils.dip2px(context,4);
            mPaint.setStrokeWidth(mStrokeWidth);

        }

        public void setColors(@NonNull int[] colors) {
            mColors = colors;
            setColorIndex(0);
        }


        public int getNextColor() {
            return mColors[getNextColorIndex()];
        }

        private int getNextColorIndex() {
            return (mColorIndex + 1) % (mColors.length);
        }

        public void goToNextColor() {
            setColorIndex(getNextColorIndex());
        }


        public int getAlpha() {
            return mAlpha;
        }

        public void setAlpha(int alpha) {
            mAlpha = alpha;
        }

        public void setColor(int color) {
            mCurrentColor = color;
        }


        public void setColorIndex(int colorIndex) {
            mColorIndex = colorIndex;
            mCurrentColor = mColors[mColorIndex];

        }

        public void setStrokeWidth(float strokeWidth) {
            mStrokeWidth = strokeWidth;
            mPaint.setStrokeWidth(strokeWidth);
        }


        public void draw(Canvas canvas, Rect bounds) {
            final RectF arcBounds = mTempBounds;
            arcBounds.set(bounds);
            canvas.translate(arcBounds.width() / 2, arcBounds.height() / 2);

            mPaint.setColor(mCurrentColor);
            smileAnimator(canvas, mPaint, arcBounds);

        }


        private void smileAnimator(Canvas canvas, Paint mPaint, RectF bounds) {
            float point = Math.min(bounds.width(), bounds.height()) * 0.4f / 2;
            float r = point * (float) Math.sqrt(2);
            RectF rectF = new RectF(-r, -r, r, r);
            canvas.save();

            // rotate
            if (animatedValue >= 135) {
                canvas.rotate(animatedValue - 135);
            }

            // draw mouth
            float startAngle = 0, sweepAngle = 0;
            if (animatedValue < 135) {
                startAngle = animatedValue + 5;
                sweepAngle = 170 + animatedValue / 3;
            } else if (animatedValue < 270) {
                startAngle = 135 + 5;
                sweepAngle = 170 + animatedValue / 3;
            } else if (animatedValue < 630) {
                startAngle = 135 + 5;
                sweepAngle = 260 - (animatedValue - 270) / 5;
            } else if (animatedValue < 720) {
                startAngle = 135 - (animatedValue - 630) / 2 + 5;
                sweepAngle = 260 - (animatedValue - 270) / 5;
            } else {
                startAngle = 135 - (animatedValue - 630) / 2 - (animatedValue - 720) / 6 + 5;
                sweepAngle = 170;
            }
            canvas.drawArc(rectF, startAngle, sweepAngle, false, mPaint);

            // draw eye
            canvas.drawPoints(new float[]{
                    -point, -point
                    , point, -point
            }, mPaint);

            canvas.restore();
        }

        public void setAnimatedValue(float v) {
            mUsedValue = animatedValue;
            if (v <= 1) // 百分比
                this.animatedValue = (int) (ANIMATED_VALUE_MAX * v);
            else // 动画的值
                this.animatedValue = (int) v;
            if (mUsedValue != animatedValue)
                invalidateSelf();
        }

        private void invalidateSelf() {
            mCallback.invalidateDrawable(null);
        }

        public int getStartingColor() {
            return mColors[mColorIndex];
        }
    }

    private final Callback mCallback = new Callback() {
        @Override
        public void invalidateDrawable(Drawable d) {
            invalidateSelf();
        }

        @Override
        public void scheduleDrawable(Drawable d, Runnable what, long when) {
            scheduleSelf(what, when);
        }

        @Override
        public void unscheduleDrawable(Drawable d, Runnable what) {
            unscheduleSelf(what);
        }
    };


}
