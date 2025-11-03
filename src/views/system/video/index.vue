<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="150px">

      <el-form-item label="摄像头名称" prop="vdnm">
        <el-input
          v-model="queryParams.vdnm"
          placeholder="请输入摄像头名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备位置" prop="vdloc">
        <el-input
          v-model="queryParams.vdloc"
          placeholder="请输入设备位置"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否云台" prop="iscloud">
        <el-radio-group v-model="queryParams.iscloud">
          <el-radio
            v-for="dict in dict.type.comm_sf"
            :key="dict.label"
            :label="dict.label"
          >{{dict.label}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="视角能看到的类型" prop="vtype">
        <el-select v-model="queryParams.vtype" placeholder="请选择视角类型" clearable size="small" style="width: 150px">
          <el-option
            v-for="dict in dict.type.veddevice_vtype"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
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
          v-hasPermi="['video:info:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['video:info:export']"
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
     <!-- <el-table-column label="所属工程编码" align="center" prop="prjcd" :show-overflow-tooltip="true"/>-->
      <el-table-column label="摄像头名称" align="center" prop="vdnm" :show-overflow-tooltip="true"/>
      <el-table-column label="设备位置" align="center" prop="vdloc" :show-overflow-tooltip="true"/>
    <!--  <el-table-column label="服务器位置" align="center" prop="servloc" :show-overflow-tooltip="true"/>-->
      <el-table-column label="通道号(端口号)" align="center" prop="cnlnum" :show-overflow-tooltip="true"/>
      <el-table-column label="经度" align="center" prop="lgtd" :show-overflow-tooltip="true"/>
      <el-table-column label="纬度" align="center" prop="lttd" :show-overflow-tooltip="true"/>
      <el-table-column label="安装时间" align="center" prop="insttm" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.insttm, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
    <!--  <el-table-column label="深圳X坐标" align="center" prop="szx" :show-overflow-tooltip="true"/>
      <el-table-column label="深圳Y坐标" align="center" prop="szy" :show-overflow-tooltip="true"/>-->
      <el-table-column label="摄像头串号" align="center" prop="csn" :show-overflow-tooltip="true"/>
      <el-table-column label="是否云台" align="center" prop="iscloud" :show-overflow-tooltip="true"/>
      <el-table-column label="来源" align="center" prop="ly" :show-overflow-tooltip="true"/>
     <!-- <el-table-column label="国际编码" align="center" prop="gbbm" :show-overflow-tooltip="true"/>-->
      <el-table-column label="设备编码" align="center" prop="sbbm" :show-overflow-tooltip="true"/>
      <el-table-column label="视频监控类型" align="center" prop="type" :show-overflow-tooltip="true"/>
     <!-- <el-table-column label="气象网格ID" align="center" prop="qxwgid" :show-overflow-tooltip="true"/>-->
      <el-table-column label="摄像头原始名称" align="center" prop="originm" :show-overflow-tooltip="true"/>
      <el-table-column label="视角能看到的类型" align="center" prop="vtypenm" :show-overflow-tooltip="true"/>
      <el-table-column label="排序号" align="center" prop="sno" :show-overflow-tooltip="true"/>
    <!--  <el-table-column label="备注" align="center" prop="rm" :show-overflow-tooltip="true"/>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['video:info:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['video:info:remove']"
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

    <!-- 添加或修改视频监控设备信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="摄像头名称" prop="vdnm">
            <el-input v-model="form.vdnm" placeholder="请输入摄像头名称" :maxlength="20"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属工程编码" prop="prjcd">
            <el-input v-model="form.prjcd" placeholder="请输入所属工程编码" :maxlength="20"/>
          </el-form-item>
        </el-col>
      </el-row>



      <el-row>
        <el-col :span="12">
          <el-form-item label="设备位置" prop="vdloc">
            <el-input v-model="form.vdloc" placeholder="请输入设备位置" :maxlength="30"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="服务器位置" prop="servloc">
            <el-input v-model="form.servloc" placeholder="请输入服务器位置" :maxlength="30"/>
          </el-form-item>
        </el-col>
      </el-row>



      <el-row>
        <el-col :span="12">
          <el-form-item label="通道号(端口号)" prop="cnlnum">
            <el-input v-model="form.cnlnum" placeholder="请输入通道号"   :maxlength="20" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账户" prop="acct">
            <el-input v-model="form.acct" placeholder="请输入账户" :maxlength="20"/>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row>
        <el-col :span="12">
          <el-form-item label="经度" prop="lgtd">
            <el-input v-model="form.lgtd" placeholder="请输入经度" :maxlength="20"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">

          <el-form-item label="纬度" prop="lttd">
            <el-input v-model="form.lttd" placeholder="请输入纬度" :maxlength="20"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="安装时间" prop="insttm">
            <el-date-picker clearable size="small"
                            v-model="form.insttm"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="请选择安装时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="深圳X坐标" prop="szx">
            <el-input v-model="form.szx" placeholder="请输入深圳X坐标" :maxlength="15"/>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row>
        <el-col :span="12">
          <el-form-item label="深圳Y坐标" prop="szy">
            <el-input v-model="form.szy" placeholder="请输入深圳Y坐标" :maxlength="15"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">

          <el-form-item label="摄像头串号" prop="csn">
            <el-input v-model="form.csn" placeholder="请输入摄像头串号" :maxlength="20"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="是否云台" prop="iscloud">
            <el-radio-group  v-model="form.iscloud">
              <el-radio
                v-for="dict in dict.type.comm_sf"
                :key="dict.label"
                :label="dict.label"
              >{{dict.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="视频监控类型" prop="type">
            <el-input v-model="form.type" placeholder="请输入视频监控类型" :maxlength="20"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="气象网格ID" prop="qxwgid">
            <el-input v-model="form.qxwgid" placeholder="请输入气象网格ID" :maxlength="10"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="摄像头原始名称" prop="originm">
            <el-input v-model="form.originm" placeholder="请输入摄像头原始名称" :maxlength="50"/>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row>
        <el-col :span="12">
          <el-form-item label="视角能看到的类型" prop="vtype">
            <el-select v-model="form.vtype" placeholder="请选择视角能看到的类型" clearable size="small">
              <el-option
                v-for="dict in dict.type.veddevice_vtype"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序号" prop="sno">
            <el-input-number :min="null" :max="999" v-model="form.sno" placeholder="请输入排序号" :precision="0" :controls="false" ></el-input-number>
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
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/nljc/video";

export default {
  name: "video-Info",
  dicts: ['veddevice_vtype','comm_sf'],
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
      // 视频监控设备信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        prjcd: null,
        vdnm: null,
        vdloc: null,
        servloc: null,
        cnlnum: null,
        acct: null,
        pawd: null,
        lgtd: null,
        lttd: null,
        insttm: null,
        rm: null,
        enable: null,
        szx: null,
        szy: null,
        csn: null,
        iscloud: null,
        ly: null,
        gbbm: null,
        sbbm: null,
        type: null,
        qxwgid: null,
        skid: null,
        hdid: null,
        originm: null,
        nlid: null,
        vtype: null,
        sno: null,
        dmbm: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        vdnm: [
          { required: true, message: "摄像头名称不能为空", trigger: "blur" }
        ],
          lgtd: [
          { required: true, message: "经度不能为空", trigger: "blur" }
        ],
          lttd: [
          { required: true, message: "纬度不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询视频监控设备信息列表 */
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
        vdid: null,
        prjcd: null,
        vdnm: null,
        vdloc: null,
        servloc: null,
        cnlnum: null,
        acct: null,
        pawd: null,
        lgtd: null,
        lttd: null,
        insttm: null,
        rm: null,
        enable: null,
        szx: null,
        szy: null,
        csn: null,
        iscloud: null,
        ly: null,
        gbbm: null,
        sbbm: null,
        type: null,
        qxwgid: null,
        skid: null,
        hdid: null,
        originm: null,
        nlid: null,
        vtype: null,
        sno: null,
        dmbm: null
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
      this.ids = selection.map(item => item.vdid)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加视频监控设备信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const vdid = row.vdid || this.ids
      getInfo(vdid).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改视频监控设备信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.vdid != null) {
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
      const vdids = row.vdid || this.ids;
      this.$modal.confirm('是否确认删除名称为"' + row.vdnm + '"的视频监控设备数据？').then(function() {
        return delInfo(vdids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('nljc/video/export', {
        ...this.queryParams
      }, `视频监控设备_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
