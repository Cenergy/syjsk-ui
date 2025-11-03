<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="120px">
      <el-form-item label="排涝设备及物资" prop="plsbjwz">
        <el-input
          v-model="queryParams.plsbjwz"
          placeholder="请输入排涝设备及物资"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
    <!--
      <el-form-item label="单位" prop="dw">
        <el-input
          v-model="queryParams.dw"
          placeholder="请输入单位"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->

      <el-form-item label="所属积涝点" prop="nldId">
        <el-select   v-model="queryParams.nldId" placeholder="请选择所属积涝点">
          <el-option
            v-for="item in nldList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
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
          v-hasPermi="['nljc:fxsb:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['nljc:fxsb:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fxsbList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="排涝设备及物资" align="center" prop="plsbjwz" :show-overflow-tooltip="true"/>
      <el-table-column label="单位" align="center" prop="dw" :show-overflow-tooltip="true"/>
      <el-table-column label="数量" align="center" prop="sl" :show-overflow-tooltip="true"/>
      <el-table-column label="所属积涝点" align="center" prop="nldnm" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['nljc:fxsb:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['nljc:fxsb:remove']"
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

    <!-- 添加或修改防汛设备对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="排涝设备及物资" prop="plsbjwz">
          <el-input v-model="form.plsbjwz" placeholder="请输入排涝设备及物资"  :maxlength="50"/>
        </el-form-item>
        <el-form-item label="单位" prop="dw">
          <el-select   v-model="form.dw" placeholder="请选择单位">
            <el-option
              v-for="dict in dict.type.fxsb_dw"
              :key="dict.label"
              :label="dict.label"
              :value="dict.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="sl">
          <el-input-number :min="null" :max="9999" v-model="form.sl" placeholder="请输入数量" :precision="0" :controls="false" ></el-input-number>
        </el-form-item>
        <el-form-item label="所属积涝点" prop="nldId">
          <el-select   v-model="form.nldId" placeholder="请选择所属积涝点">
            <el-option
              v-for="item in nldList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listFxsb, getFxsb, delFxsb, addFxsb, updateFxsb } from "@/api/nljc/fxsb";
import { getWaterLoggingPointBaseInfo } from "@/api/nljc/index"
export default {
  name: "Fxsb",
  dicts: ['fxsb_dw'],
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
      // 防汛设备表格数据
      fxsbList: [],
      // 弹出层标题
      title: "",
      nldList:[],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        plsbjwz: null,
        dw: null,
        sl: null,
        nldId: null,
        enable: null,
        dt: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        plsbjwz: [
          { required: true, message: "排涝设备及物资不能为空", trigger: "blur" }
        ],
        dw: [
          { required: true, message: "单位不能为空", trigger: "blur" }
        ],
        sl: [
          { required: true, message: "数量不能为空", trigger: "blur" }
        ],
        nldId: [
          { required: true, message: "所属积涝点不能为空", trigger: "blur" }
        ],

      }
    };
  },
  created() {
    this.getList();
    this.getNldList();
  },
  methods: {
    getNldList() {
      getWaterLoggingPointBaseInfo(null)
        .then(res => {
          this.nldList = res.data;
        })
    },
    /** 查询防汛设备列表 */
    getList() {
      this.loading = true;
      listFxsb(this.queryParams).then(response => {
        this.fxsbList = response.rows;
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
        plsbjwz: null,
        dw: null,
        sl: null,
        nldId: null,
        enable: null,
        dt: null
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
      this.title = "添加防汛设备";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getFxsb(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改防汛设备";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateFxsb(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addFxsb(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除名称为"' + row.plsbjwz + '"的防汛设备数据？').then(function() {
        return delFxsb(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('nljc/fxsb/export', {
        ...this.queryParams
      }, `防汛设备_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
