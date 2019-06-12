package com.androidcodelibs.listgrid.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.SectionIndexer;
import android.widget.TextView;


import com.androidcodelibs.listgrid.R;
import com.androidcodelibs.listgrid.bean.City;

import java.util.List;


public class CityListAdapter extends BaseAdapter implements SectionIndexer {
    private List<City> list = null;
    private Context mContext;

    public CityListAdapter(Context mContext, List<City> list) {
        this.mContext = mContext;
        this.list = list;
    }

    public int getCount() {
        return this.list.size();
    }

    public Object getItem(int position) {
        return list.get(position);
    }

    public long getItemId(int position) {
        return position;
    }

    public View getView(final int position, View convertView, ViewGroup arg2) {
        ViewHolder viewHolder = null;
        final City city = list.get(position);
        if (convertView == null) {
            viewHolder = new ViewHolder();
            convertView = LayoutInflater.from(mContext).inflate(R.layout.view_city_list_item, null);
            viewHolder.cityLetter = (TextView) convertView.findViewById(R.id.city_letter);
            viewHolder.cityName = (TextView) convertView.findViewById(R.id.city_name);
            convertView.setTag(viewHolder);

        } else {
            viewHolder = (ViewHolder) convertView.getTag();
        }

        //根据position获取分类的首字母的Char ascii值
        int section = getSectionForPosition(position);

        //如果当前位置等于该分类首字母的Char的位置 ，则认为是第一次出现
        if (position == getPositionForSection(section)) {
            viewHolder.cityLetter.setVisibility(View.VISIBLE);
            viewHolder.cityLetter.setText(city.getFirstLetter());
        } else {
            viewHolder.cityLetter.setVisibility(View.GONE);
        }

        viewHolder.cityName.setText(this.list.get(position).getName());

        return convertView;

    }

    /**
     * 当ListView数据发生变化时,调用此方法来更新ListView
     *
     * @param list
     */
    public void updateListView(List<City> list) {
        this.list.clear();
        this.list.addAll(list);
        notifyDataSetChanged();
    }


    final static class ViewHolder {
        TextView cityLetter;
        TextView cityName;
    }


    /**
     * 根据ListView的当前位置获取分类的首字母的Char ascii值
     */
    public int getSectionForPosition(int position) {
        return list.get(position).getFirstLetter().charAt(0);
    }

    /**
     * 根据分类的首字母的Char ascii值获取其第一次出现该首字母的位置
     */
    public int getPositionForSection(int section) {
        for (int i = 0; i < getCount(); i++) {
            String sortStr = list.get(i).getFirstLetter();
            char firstChar = sortStr.toUpperCase().charAt(0);
            if (firstChar == section) {
                return i;
            }
        }

        return -1;
    }

    /**
     * 提取英文的首字母，非英文字母用#代替。
     *
     * @param str
     * @return
     */
    private String getAlpha(String str) {
        String sortStr = str.trim().substring(0, 1).toUpperCase();
        // 正则表达式，判断首字母是否是英文字母
        if (sortStr.matches("[A-Z]")) {
            return sortStr;
        } else {
            return "#";
        }
    }

    @Override
    public Object[] getSections() {
        return null;
    }
}