package com.androidcodelibs.listgrid.activity

import android.os.AsyncTask
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.text.Editable
import android.text.TextUtils
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView

import com.alibaba.android.arouter.facade.annotation.Route
import com.alibaba.android.arouter.launcher.ARouter
import com.androidcodelibs.androidutilslib.utils.CharacterUtils
import com.androidcodelibs.common.router.IRouter
import com.androidcodelibs.listgrid.R
import com.androidcodelibs.listgrid.adapter.CityListAdapter
import com.androidcodelibs.listgrid.bean.City
import com.androidcodelibs.listgrid.view.LetterFilterListView

import java.util.ArrayList
import java.util.Collections

/**
 * Copyright 李挺哲
 * 创建人：litingzhe
 * 邮箱：453971498@qq.com
 * Created by litingzhe on 2017/4/27 上午9:28.
 * 类描述：城市列表 Activity
 */

@Route(path = IRouter.IRouter_CityListViewActivity)
class CityListViewActivity : AppCompatActivity() {
    internal lateinit var navBack: LinearLayout
    internal lateinit var navTitle: TextView
    internal lateinit var searchEditText: EditText
    internal lateinit var listView: ListView
    internal lateinit var letterView: LetterFilterListView
    private var mCityListAdapter: CityListAdapter? = null
    private var list: ArrayList<City>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_citylist)
        ARouter.getInstance().inject(this)

        initView()


    }

    private fun initView() {
        val headerView = LayoutInflater.from(this).inflate(R.layout.view_city_header, null)
        navBack = findViewById(R.id.nav_back)
        navTitle = findViewById(R.id.nav_title)
        searchEditText = findViewById(R.id.et_search)
        listView = findViewById(R.id.lv_city)
        letterView = findViewById(R.id.letterView)
        navTitle.text = "城市列表"
        navBack.setOnClickListener { finish() }

        listView.addHeaderView(headerView)
        list = ArrayList()

        // 使用自定义的Adapter
        mCityListAdapter = CityListAdapter(this, list)
        listView.adapter = mCityListAdapter

        getData()

        searchEditText.addTextChangedListener(object : TextWatcher {

            override fun onTextChanged(s: CharSequence, start: Int, before: Int,
                                       count: Int) {
                val str = searchEditText.text.toString().trim { it <= ' ' }
                val length = str.length
                if (length > 0) {
                    filterData(str)
                } else {
                    //
                    getData()
                }
            }

            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int,
                                           after: Int) {
            }

            override fun afterTextChanged(s: Editable) {

            }
        })


    }


    internal fun getData() {

        val asyncTask = object : AsyncTask<Void, Void, List<*>>() {
            override fun doInBackground(vararg params: Void): List<*>? {

                var newList: List<City>? = null
                try {
                    newList = filledData(resources.getStringArray(R.array.list))
                } catch (e: Exception) {
                }

                return newList
            }

            override fun onPostExecute(newList: List<*>) {
                list!!.clear()
                list!!.addAll(newList as List<City>)
                //通知Dialog
                mCityListAdapter!!.notifyDataSetChanged()

                super.onPostExecute(list)
            }
        }
        asyncTask.execute()

    }


    /**
     * 为ListView填充数据
     *
     * @param
     * @return
     */
    private fun filledData(array: Array<String>): List<City> {
        val newList = ArrayList<City>()
        //实例化汉字转拼音类
        //        AbCharacterUtil characterParser = AbCharacterUtil.g;

        for (i in array.indices) {
            val city = City()
            city.name = array[i]
            //汉字转换成拼音
            val pinyin = CharacterUtils.getSelling(array[i])
            val sortString = pinyin.substring(0, 1).toUpperCase()

            // 正则表达式，判断首字母是否是英文字母
            if (sortString.matches("[A-Z]".toRegex())) {
                city.firstLetter = sortString.toUpperCase()
            } else {
                city.firstLetter = "#"
            }
            newList.add(city)
        }
        Collections.sort(newList)
        return newList

    }

    /**
     * 根据输入框中的值来过滤数据并更新ListView
     *
     * @param filterStr
     */
    private fun filterData(filterStr: String) {
        //实例化汉字转拼音类
        //        AbCharacterParser characterParser = AbCharacterParser.getInstance();
        val filterDateList = ArrayList<City>()
        if (!TextUtils.isEmpty(filterStr)) {
            for (city in list!!) {
                val name = city.name
                if (name.indexOf(filterStr) != -1 || CharacterUtils.getSelling(name).startsWith(filterStr)) {
                    filterDateList.add(city)
                }
            }
        }

        // 根据a-z进行排序
        Collections.sort(filterDateList)
        mCityListAdapter!!.updateListView(filterDateList)
    }

}
