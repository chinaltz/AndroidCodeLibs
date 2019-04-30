package com.androidcodelibs.appcode.home.adapter;

import android.content.Context;
import android.support.annotation.NonNull;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.androidcodelibs.androidutilslib.view.listener.ALOnItemClickListener;
import com.androidcodelibs.appcode.R;
import com.androidcodelibs.appcode.home.model.SampleModel;

import java.util.ArrayList;

/**
 * @author:litingzhe
 * @date: 2019/4/30   14:29
 * @description: 例子列表 适配器
 * @git:https://github.com/chinaltz
 * @简书地址:https://www.jianshu.com/u/3d8c73dff561
 */
public class SamplesAdapter extends RecyclerView.Adapter<SamplesAdapter.ViewHolder> {
    /**
     * 数据
     */
    private ArrayList<SampleModel> datas;
    /**
     * 上下文对象
     */
    private Context mContext;


    private ALOnItemClickListener onItemClickListener;


    public ALOnItemClickListener getOnItemClickListener() {
        return onItemClickListener;
    }

    public void setOnItemClickListener(ALOnItemClickListener onItemClickListener) {
        this.onItemClickListener = onItemClickListener;
    }

    public SamplesAdapter(Context mContext, ArrayList<SampleModel> datas) {
        this.mContext = mContext;
        this.datas = datas;

    }

    public ArrayList<SampleModel> getDatas() {
        return datas;
    }

    public void setDatas(ArrayList<SampleModel> datas) {
        this.datas = datas;
    }

    public Context getmContext() {
        return mContext;
    }

    public void setmContext(Context mContext) {
        this.mContext = mContext;
    }


    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup viewGroup, int position) {

        View view = LayoutInflater.from(mContext).inflate(R.layout.main_item_sample_list, viewGroup, false);

        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder viewHolder, final int position) {

        SampleModel model = datas.get(position);
        viewHolder.imageView.setImageDrawable(mContext.getResources().getDrawable(model.getDrawableId()));
        viewHolder.textView.setText(model.getTitle());

        viewHolder.itemView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (onItemClickListener != null) {
                    onItemClickListener.onItemClick(view, position);
                }
            }
        });


    }

    @Override
    public int getItemCount() {
        return datas.size();
    }


    static class ViewHolder extends RecyclerView.ViewHolder {

        ImageView imageView;

        TextView textView;

        ViewHolder(View view) {
            super(view);
            imageView = view.findViewById(R.id.imageView);
            textView = view.findViewById(R.id.textView);
        }
    }
}
