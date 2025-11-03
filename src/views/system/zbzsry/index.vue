<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="姓名" prop="mc">
        <el-input
          v-model="queryParams.mc"
          placeholder="请输入姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属单位" prop="ssdw">
        <el-select   v-model="queryParams.ssdw" placeholder="请选择所属单位">
          <el-option
            v-for="dict in dict.type.tb_zbzsry_ssdw"
            :key="dict.label"
            :label="dict.label"
            :value="dict.label"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="负责积涝点" prop="nldId">
        <el-select   v-model="queryParams.nldId" placeholder="请选择负责积涝点">
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
          v-hasPermi="['nljc:zbzsry:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['nljc:zbzsry:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="zbzsryList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center" prop="mc" :show-overflow-tooltip="true"/>
      <el-table-column label="联系电话" align="center" prop="lxdh" :show-overflow-tooltip="true"/>
      <el-table-column label="所属单位" align="center" prop="ssdw" :show-overflow-tooltip="true"/>
      <el-table-column label="负责积涝点" align="center" prop="nldnm" :show-overflow-tooltip="true"/>
      <el-table-column label="所属社区" align="center" prop="sssq" :show-overflow-tooltip="true"/>
      <el-table-column label="职务名称" align="center" prop="zwmc" :show-overflow-tooltip="true"/>
      <el-table-column label="排序号" align="center" prop="sno" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['nljc:zbzsry:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['nljc:zbzsry:remove']"
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

    <!-- 添加或修改值班值守人员对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="名称" prop="mc">
          <el-input v-model="form.mc" placeholder="请输入名称"  :maxlength="50"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="lxdh">
          <el-input v-model="form.lxdh" placeholder="请输入联系电话"  :maxlength="20"/>
        </el-form-item>
        <el-form-item label="所属单位" prop="ssdw">
          <el-select   v-model="form.ssdw" placeholder="请选择所属单位">
            <el-option
              v-for="dict in dict.type.tb_zbzsry_ssdw"
              :key="dict.label"
              :label="dict.label"
              :value="dict.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责积涝点" prop="nldId">
          <el-select   v-model="form.nldId" placeholder="请选择负责积涝点">
            <el-option
              v-for="item in nldList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属社区" prop="sssq">
          <el-input v-model="form.sssq" placeholder="请输入所属社区"  :maxlength="30"/>
        </el-form-item>
        <el-form-item label="职务名称" prop="zwmc">
          <el-input v-model="form.zwmc" placeholder="请输入职务名称"  :maxlength="20"/>
        </el-form-item>
        <el-form-item label="排序号" prop="sno">
          <el-input-number :min="null" :max="999" v-model="form.sno" placeholder="请输入排序" :precision="0" :controls="false" ></el-input-number>
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
import { listZbzsry, getZbzsry, delZbzsry, addZbzsry, updateZbzsry } from "@/api/nljc/zbzsry";
import { getWaterLoggingPointBaseInfo } from "@/api/nljc/index"
export default {
  name: "Zbzsry",
  dicts: ['tb_zbzsry_ssdw'],
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
      // 值班值守人员表格数据
      zbzsryList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        mc: null,
        lxdh: null,
        ssdw: null,
        nldId: null,
        sssq: null,
        zwmc: null,
        sno: null,
        enable: null,
        dt: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sno: [
          { required: true, message: "排序号不能为空", trigger: "blur" }
        ],
        mc: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        nldId: [
          { required: true, message: "积涝点不能为空", trigger: "blur" }
        ],
        ssdw: [
          { required: true, message: "所属单位不能为空", trigger: "blur" }
        ],
      },
      nldList:[]
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
    /** 查询值班值守人员列表 */
    getList() {
      this.loading = true;
      listZbzsry(this.queryParams).then(response => {
        this.zbzsryList = response.rows;
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
        mc: null,
        lxdh: null,
        ssdw: null,
        nldId: null,
        sssq: null,
        zwmc: null,
        sno: null,
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
      this.title = "添加值班值守人员";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getZbzsry(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改值班值守人员";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateZbzsry(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addZbzsry(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除姓名为"' + row.mc + '"的值班值守人员数据？').then(function() {
        return delZbzsry(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('nljc/zbzsry/export', {
        ...this.queryParams
      }, `值班值守人员_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
