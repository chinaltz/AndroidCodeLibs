package com.androidcodelibs.listgrid.activity

import android.os.Bundle
import android.util.Log
import android.widget.LinearLayout
import android.widget.TextView
import com.alibaba.android.arouter.facade.annotation.Route
import com.alibaba.android.arouter.launcher.ARouter
import com.andrognito.patternlockview.PatternLockView
import com.andrognito.patternlockview.listener.PatternLockViewListener
import com.andrognito.patternlockview.utils.PatternLockUtils
import com.andrognito.patternlockview.utils.ResourceUtils
import com.androidcodelibs.androidutilslib.app.base.BaseActivity
import com.androidcodelibs.androidutilslib.utils.ToastUtils
import com.androidcodelibs.common.router.IRouter
import com.androidcodelibs.listgrid.R
import kotlinx.android.synthetic.main.activity_nine_lock.*

@Route(path = IRouter.IRouter_NineLockActivity)
class NineLockActivity : BaseActivity() {
    lateinit var navback: LinearLayout
    lateinit var navTitle: TextView


    private val mPatternLockViewListener = object : PatternLockViewListener {
        override fun onStarted() {
            Log.d(javaClass.name, "Pattern drawing started")
        }

        override fun onProgress(progressPattern: List<PatternLockView.Dot>) {
            Log.d(javaClass.name, "Pattern progress: " + PatternLockUtils.patternToString(patter_lock_view, progressPattern))
        }

        override fun onComplete(pattern: List<PatternLockView.Dot>) {
            Log.d(javaClass.name, "Pattern complete: " + PatternLockUtils.patternToString(patter_lock_view, pattern))

            ToastUtils.showShort("" + PatternLockUtils.patternToString(patter_lock_view, pattern))
            //            AbSnackbarUtil.ShortSnackbar(mPatternLockView, "" + PatternLockUtils.patternToString(mPatternLockView, pattern), AbSnackbarUtil.Info);
            patter_lock_view.clearPattern()
        }

        override fun onCleared() {


            Log.d(javaClass.name, "Pattern has been cleared")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ARouter.getInstance().inject(this)
        setContentView(R.layout.activity_nine_lock)
        navback = findViewById(R.id.nav_back)
        navback.setOnClickListener {
            finish()
        }
        navTitle = findViewById(R.id.nav_title)
        navTitle.text = "九宫格解锁"


        patter_lock_view.dotCount = 3
        patter_lock_view.dotNormalSize = ResourceUtils.getDimensionInPx(this, R.dimen.pattern_lock_dot_size).toInt()
        patter_lock_view.dotSelectedSize = ResourceUtils.getDimensionInPx(this, R.dimen.pattern_lock_dot_selected_size).toInt()
        patter_lock_view.pathWidth = ResourceUtils.getDimensionInPx(this, R.dimen.pattern_lock_path_width).toInt()
        patter_lock_view.isAspectRatioEnabled = true
        patter_lock_view.aspectRatio = PatternLockView.AspectRatio.ASPECT_RATIO_HEIGHT_BIAS
        patter_lock_view.setViewMode(PatternLockView.PatternViewMode.CORRECT)
        patter_lock_view.dotAnimationDuration = 150
        patter_lock_view.pathEndAnimationDuration = 100
        patter_lock_view.correctStateColor = ResourceUtils.getColor(this, R.color.white)
        patter_lock_view.isInStealthMode = false
        patter_lock_view.isTactileFeedbackEnabled = true
        patter_lock_view.isInputEnabled = true
        patter_lock_view.addPatternLockListener(mPatternLockViewListener)

    }
}
