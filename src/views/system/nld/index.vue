<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="160px">
      <el-form-item label="积涝点名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入积涝点名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="责任单位" prop="zrdw">
        <el-input
          v-model="queryParams.zrdw"
          placeholder="请输入责任单位"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="积涝情况" prop="nlqk">
        <el-input
          v-model="queryParams.nlqk"
          placeholder="请输入积涝情况"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="积涝原因" prop="nlyy">
        <el-input
          v-model="queryParams.nlyy"
          placeholder="请输入积涝原因"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
     <!-- <el-form-item label="建设内容" prop="jsnr">
        <el-input
          v-model="queryParams.jsnr"
          placeholder="请输入建设内容"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->
      <el-form-item label="整治年份" prop="zznf">
        <el-input
          v-model="queryParams.zznf"
          placeholder="请输入整治年份"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

     <!-- <el-form-item label="工程名称" prop="gcmc">
        <el-input
          v-model="queryParams.gcmc"
          placeholder="请输入工程名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->
      <el-form-item label="行政区划" prop="xzqh">
        <el-input
          v-model="queryParams.xzqh"
          placeholder="请输入行政区划"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

     <!-- <el-form-item label="街道" prop="jd">
        <el-input
          v-model="queryParams.jd"
          placeholder="请输入街道"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->
      <!--<el-form-item label="所属片区" prop="sspq">
        <el-input
          v-model="queryParams.sspq"
          placeholder="请输入所属片区"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="等级" prop="dj">
        <el-input
          v-model="queryParams.dj"
          placeholder="请输入等级"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->

      <el-form-item label="联系人" prop="lxr">
        <el-input
          v-model="queryParams.lxr"
          placeholder="请输入联系人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

    <!--  <el-form-item label="所属社区" prop="sssq">
        <el-input
          v-model="queryParams.sssq"
          placeholder="请输入所属社区"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->

      <el-form-item label="市局关注的积涝点" prop="sjgz">
        <el-radio-group v-model="form.sjgz">
          <el-radio
            v-for="dict in dict.type.comm_sf"
            :key="dict.value"
            :label="dict.value"
          >{{dict.label}}</el-radio>
        </el-radio-group>
      </el-form-item>
     <!-- <el-form-item label="处置预案" prop="czya">
        <el-input
          v-model="queryParams.czya"
          placeholder="请输入处置预案"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->

      <el-form-item label="水尺责任人" prop="zrr">
        <el-input
          v-model="queryParams.zrr"
          placeholder="请输入水尺责任人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
    <!--  <el-form-item label="数据来源" prop="ds">
        <el-input
          v-model="queryParams.ds"
          placeholder="请输入数据来源"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['nld:info:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['nld:info:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="积涝点名称" align="center" prop="name" :show-overflow-tooltip="true"/>
      <el-table-column label="责任单位" align="center" prop="zrdw" :show-overflow-tooltip="true"/>
      <el-table-column label="积涝情况" align="center" prop="nlqk" :show-overflow-tooltip="true"/>
      <el-table-column label="积涝原因" align="center" prop="nlyy" :show-overflow-tooltip="true"/>
      <el-table-column label="建设内容" align="center" prop="jsnr" :show-overflow-tooltip="true"/>
      <el-table-column label="整治年份" align="center" prop="zznf" :show-overflow-tooltip="true"/>
      <el-table-column label="X" align="center" prop="x" :show-overflow-tooltip="true"/>
      <el-table-column label="Y" align="center" prop="y" :show-overflow-tooltip="true"/>
      <!--<el-table-column label="工程名称" align="center" prop="gcmc">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.${column.dictType}" :value="scope.row.gcmc"/>
        </template>
      </el-table-column>-->
      <el-table-column label="行政区划" align="center" prop="xzqh" :show-overflow-tooltip="true"/>
      <el-table-column label="街道" align="center" prop="jd" :show-overflow-tooltip="true"/>
      <el-table-column label="等级" align="center" prop="dj" :show-overflow-tooltip="true"/>
      <el-table-column label="联系人" align="center" prop="lxr" :show-overflow-tooltip="true"/>
      <el-table-column label="联系电话" align="center" prop="lxdh" :show-overflow-tooltip="true"/>
      <el-table-column label="防御指引" align="center" prop="fyzy" :show-overflow-tooltip="true"/>
      <el-table-column label="预置力量" align="center" prop="yzll" :show-overflow-tooltip="true"/>
      <el-table-column label="处置预案" align="center" prop="czya" :show-overflow-tooltip="true"/>
      <el-table-column label="水尺责任人" align="center" prop="zrr" :show-overflow-tooltip="true"/>
      <el-table-column label="责任人电话" align="center" prop="zrrdh"  :show-overflow-tooltip="true"/>
      <el-table-column label="数据来源" align="center" prop="ds"  :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['nld:info:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['nld:info:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改积涝点基本信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1050px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="积涝点名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入积涝点名称" :maxlength="100"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="责任单位" prop="zrdw">
              <el-input v-model="form.zrdw" placeholder="请输入责任单位" :maxlength="100"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="积涝情况" prop="nlqk">
              <el-input v-model="form.nlqk" type="textarea" :rows="3" placeholder="请输入积涝情况"  oninput="if(value.length>1000)value=value.slice(0,1000)"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="积涝原因" prop="nlyy">
              <el-input v-model="form.nlyy" type="textarea" :rows="3" placeholder="请输入积涝原因"  oninput="if(value.length>1000)value=value.slice(0,1000)"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="建设内容" prop="jsnr">
              <el-input v-model="form.jsnr" type="textarea" :rows="3" placeholder="请输入建设内容"  oninput="if(value.length>1000)value=value.slice(0,1000)"/>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row>
          <el-col :span="12">
            <el-form-item label="整治年份" prop="zznf">
              <el-input v-model="form.zznf" placeholder="请输入整治年份" :maxlength="10"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="X坐标" prop="x">
              <el-input v-model="form.x" placeholder="请输入X坐标" :maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="Y坐标" prop="y">
              <el-input v-model="form.y" placeholder="请输入Y坐标" :maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工程名称" prop="gcmc">
              <el-input v-model="form.gcmc" placeholder="请输入工程名称" :maxlength="100"/>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="行政区划" prop="xzqh">
              <el-input v-model="form.xzqh" placeholder="请输入行政区划" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="街道" prop="jd">
              <el-input v-model="form.jd" placeholder="请输入街道" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属片区" prop="sspq">
              <el-input v-model="form.sspq" placeholder="请输入所属片区" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="等级" prop="dj">
              <el-input v-model="form.dj" placeholder="请输入等级" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="属性" prop="sx">
              <el-input v-model="form.sx" placeholder="请输入属性" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="完成时限" prop="wcsx">
              <el-input v-model="form.wcsx" placeholder="请输入完成时限" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="联系人" prop="lxr">
              <el-input v-model="form.lxr" placeholder="请输入联系人" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="联系电话" prop="lxdh">
              <el-input v-model="form.lxdh" placeholder="请输入联系电话" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所在排水分区ID" prop="sspsfqid">
              <el-input v-model="form.sspsfqid" placeholder="请输入所在排水分区ID" :maxlength="10"/>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="积涝监测编码" prop="nljcbm">
              <el-input v-model="form.nljcbm" placeholder="请输入积涝监测编码" :maxlength="20"/>
            </el-form-item>

          </el-col>
          <el-col :span="8">
            <el-form-item label="降雨量测站编码" prop="yjlczbm">
              <el-input v-model="form.yjlczbm" placeholder="请输入降雨量测站编码" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="气象预报网格编码" prop="qxybwgbm">
              <el-input v-model="form.qxybwgbm" placeholder="请输入气象预报网格编码" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="降雨与积水面积关系" prop="yjyssgx">
              <el-input-number :min="null" :max="99999" v-model="form.yjyssgx" placeholder="请输入降雨与积水面积关系" :precision="4" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="半小时预报积水量" prop="bxsybjsl">
              <el-input-number :min="null" :max="99999" v-model="form.bxsybjsl" placeholder="请输入半小时预报积水量" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="1小时预报积水量" prop="yxsybjsl">
              <el-input-number :min="null" :max="99999" v-model="form.yxsybjsl" placeholder="请输入1小时预报积水量" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="3小时预报积水量" prop="sxsybjsl">
              <el-input-number :min="null" :max="99999" v-model="form.sxsybjsl" placeholder="请输入3小时预报积水量" :precision="2" :controls="false" ></el-input-number>
          </el-form-item>

          </el-col>
          <el-col :span="8">
            <el-form-item label="半小时预报降雨量" prop="bxsybjyl">
              <el-input-number :min="null" :max="99999" v-model="form.bxsybjyl" placeholder="请输入半小时预报降雨量" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="1小时预报降雨量" prop="yxsybjyl">
              <el-input-number :min="null" :max="99999" v-model="form.yxsybjyl" placeholder="请输入1小时预报降雨量" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="3小时预报降雨量" prop="sxsybjyl">
              <el-input-number :min="null" :max="99999" v-model="form.sxsybjyl" placeholder="请输入3小时预报降雨量" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="半小时积水深度" prop="depth30">
              <el-input-number :min="null" :max="99999" v-model="form.depth30" placeholder="请输入半小时积水深度" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="1小时积水深度" prop="depth60">
              <el-input-number :min="null" :max="99999" v-model="form.depth60" placeholder="请输入1小时积水深度" :precision="2" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="3小时积水深度" prop="depth180">
              <el-input-number :min="null" :max="99999" v-model="form.depth180" placeholder="请输入3小时积水深度" :precision="2" :controls="false" ></el-input-number>
          </el-form-item>

          </el-col>
          <el-col :span="8">

            <el-form-item label="是否完成更新数据" prop="sfwcgx">
              <el-radio-group v-model="form.sfwcgx">
                <el-radio
                  v-for="dict in dict.type.comm_sf"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="所属社区" prop="sssq">
              <el-input v-model="form.sssq" placeholder="请输入所属社区" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="所属网格" prop="sswg">
              <el-input v-model="form.sswg" placeholder="请输入所属网格" :maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="降雨阈值" prop="jyyz">
              <el-input v-model="form.jyyz" placeholder="请输入降雨阈值" :maxlength="120"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="积水要素" prop="jsys">
              <el-input v-model="form.jsys" placeholder="请输入积水要素" :maxlength="120"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="防御指引" prop="fyzy">
              <el-input v-model="form.fyzy" type="textarea" :rows="3" placeholder="请输入防御指引"  oninput="if(value.length>1000)value=value.slice(0,1000)"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="预置力量" prop="yzll">
              <el-input v-model="form.yzll" type="textarea" :rows="3" placeholder="请输入预置力量"  oninput="if(value.length>1000)value=value.slice(0,1000)"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">

            <el-form-item label="街道联系人" prop="jdlxr">
              <el-input v-model="form.jdlxr" placeholder="请输入街道联系人" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="街道联系人电话" prop="jdlxrdh">
              <el-input v-model="form.jdlxrdh" placeholder="请输入街道联系人电话" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="社区联系人" prop="sqlxr">
              <el-input v-model="form.sqlxr" placeholder="请输入社区联系人" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="社区联系人电话" prop="sqlxrdh">
              <el-input v-model="form.sqlxrdh" placeholder="请输入社区联系人电话" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="雨量站" prop="ylz">
              <el-input v-model="form.ylz" placeholder="请输入雨量站" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="监控设备情况" prop="jksbqk">
              <el-input v-model="form.jksbqk" placeholder="请输入监控设备情况" :maxlength="100"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="是否是市局关注的积涝点" prop="sjgz">
              <el-radio-group v-model="form.sjgz">
                <el-radio
                  v-for="dict in dict.type.comm_sf"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡查部门名称" prop="xcbmmc">
              <el-input v-model="form.xcbmmc" placeholder="请输入巡查部门名称" :maxlength="100"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="积涝点编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入积涝点编码" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="处置预案" prop="czya">
              <el-input v-model="form.czya" type="textarea" :rows="3" placeholder="请输入处置预案"  oninput="if(value.length>1000)value=value.slice(0,1000)"/>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="8">
            <el-form-item label="水尺责任人" prop="zrr">
              <el-input v-model="form.zrr" placeholder="请输入水尺责任人" :maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">

            <el-form-item label="责任人电话" prop="zrrdh">
              <el-input v-model="form.zrrdh" placeholder="请输入责任人电话" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数据来源" prop="ds">
              <el-input v-model="form.ds" placeholder="请输入数据来源" :maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="备注" prop="rm">
              <el-input v-model="form.rm" type="textarea" :rows="3" placeholder="请输入备注"  oninput="if(value.length>200)value=value.slice(0,200)"/>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/system/nldinfo";

export default {
  name: "nldinfo",
  dicts: ['comm_sf'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 积涝点基本信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        zrdw: null,
        nlqk: null,
        nlyy: null,
        jsnr: null,
        zznf: null,
        x: null,
        y: null,
        enable: null,
        dt: null,
        userid: null,
        gcmc: null,
        xzqh: null,
        rm: null,
        jd: null,
        sspq: null,
        dj: null,
        sx: null,
        wcsx: null,
        lxr: null,
        lxdh: null,
        sspsfqid: null,
        nljcbm: null,
        yjlczbm: null,
        qxybwgbm: null,
        yjyssgx: null,
        bxsybjsl: null,
        yxsybjsl: null,
        sxsybjsl: null,
        bxsybjyl: null,
        yxsybjyl: null,
        sxsybjyl: null,
        flag: null,
        depth30: null,
        depth60: null,
        depth180: null,
        sfwcgx: null,
        sssq: null,
        sswg: null,
        jyyz: null,
        jsys: null,
        fyzy: null,
        yzll: null,
        jdlxr: null,
        jdlxrdh: null,
        sqlxr: null,
        sqlxrdh: null,
        ylz: null,
        jksbqk: null,
        sjgz: null,
        czya: null,
        xcbmmc: null,
        code: null,
        zrr: null,
        zrrdh: null,
        ds: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "积涝点名称不能为空", trigger: "blur" }
        ],
      /*  zrdw: [
          { required: true, message: "责任单位不能为空", trigger: "blur" }
        ],*/
      /*  nlqk: [
          { required: true, message: "积涝情况不能为空", trigger: "blur" }
        ],*/
        nlyy: [
          { required: true, message: "积涝原因不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询积涝点基本信息列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        zrdw: null,
        nlqk: null,
        nlyy: null,
        jsnr: null,
        zznf: null,
        x: null,
        y: null,
        enable: null,
        dt: null,
        userid: null,
        gcmc: null,
        xzqh: null,
        rm: null,
        jd: null,
        sspq: null,
        dj: null,
        sx: null,
        wcsx: null,
        lxr: null,
        lxdh: null,
        sspsfqid: null,
        nljcbm: null,
        yjlczbm: null,
        qxybwgbm: null,
        yjyssgx: null,
        bxsybjsl: null,
        yxsybjsl: null,
        sxsybjsl: null,
        bxsybjyl: null,
        yxsybjyl: null,
        sxsybjyl: null,
        flag: null,
        depth30: null,
        depth60: null,
        depth180: null,
        sfwcgx: null,
        sssq: null,
        sswg: null,
        jyyz: null,
        jsys: null,
        fyzy: null,
        yzll: null,
        jdlxr: null,
        jdlxrdh: null,
        sqlxr: null,
        sqlxrdh: null,
        ylz: null,
        jksbqk: null,
        sjgz: null,
        czya: null,
        xcbmmc: null,
        code: null,
        zrr: null,
        zrrdh: null,
        ds: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加积涝点基本信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getInfo(id).then(response => {
        this.form = response.data;
        let sjgz = this.form.sjgz;
        if(sjgz=='1'){
          this.form.sjgz='1';
        }else{
          this.form.sjgz='0';
        }
        this.open = true;
        this.title = "修改积涝点基本信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInfo(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除名称为"' + row.name + '"的积涝点基本信息？').then(function() {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('nljc/nldinfo/export', {
        ...this.queryParams
      }, `info_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
