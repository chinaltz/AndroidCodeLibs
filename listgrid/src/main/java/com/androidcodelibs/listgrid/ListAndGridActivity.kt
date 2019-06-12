package com.androidcodelibs.listgrid

import android.os.Bundle
import android.support.design.widget.FloatingActionButton
import android.support.design.widget.Snackbar
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.LinearLayoutManager
import android.support.v7.widget.RecyclerView
import android.support.v7.widget.Toolbar
import android.view.View

import com.alibaba.android.arouter.facade.annotation.Autowired
import com.alibaba.android.arouter.facade.annotation.Route
import com.alibaba.android.arouter.launcher.ARouter
import com.androidcodelibs.androidutilslib.app.base.BaseActivity
import com.androidcodelibs.androidutilslib.utils.JsonUtil
import com.androidcodelibs.androidutilslib.utils.ToastUtils
import com.androidcodelibs.androidutilslib.view.listener.ALOnItemClickListener
import com.androidcodelibs.common.adapter.SamplesAdapter
import com.androidcodelibs.common.router.IRouter
import com.androidcodelibs.entity.common.SampleModel

import java.io.Serializable
import java.util.ArrayList

@Route(path = IRouter.IRouter_ListAndGridActivity)
class ListAndGridActivity : BaseActivity() {


    private var mRecyleView: RecyclerView? = null
    private var listGridList: ArrayList<SampleModel>? = null
    private var samplesAdapter: SamplesAdapter? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_listgrid_list)
        ARouter.getInstance().inject(this)
        initData()
        initView()


    }

    private fun initView() {
        mRecyleView = findViewById(R.id.recyclerView)
        samplesAdapter = SamplesAdapter(mContext, listGridList)
        mRecyleView!!.layoutManager = LinearLayoutManager(mContext)
        mRecyleView!!.adapter = samplesAdapter
        samplesAdapter!!.onItemClickListener = ALOnItemClickListener { view, position ->
            val aRouter = ARouter.getInstance()
            when (position) {
                0 -> aRouter.build(IRouter.IRouter_CityListViewActivity).navigation()
                1 -> aRouter.build(IRouter.IRouter_NineLockActivity).navigation()
            }
        }

    }

    fun initData() {
        listGridList = ArrayList()

        val sampleModel1 = SampleModel("城市列表/通讯录", R.drawable.above_shadow)
        val sampleModel2 = SampleModel("九宫格解锁", R.drawable.above_shadow)
        listGridList!!.add(sampleModel1)
        listGridList!!.add(sampleModel2)

    }

}
