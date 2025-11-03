<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="120px">

    <!--  <el-form-item label="所属区" prop="subarea">
        <el-input
          v-model="queryParams.subarea"
          placeholder="请输入所属区"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
-->
      <el-form-item label="车辆管理单位" prop="manageUnit">
        <el-input
          v-model="queryParams.manageUnit"
          placeholder="请输入车辆管理单位"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
     <!-- <el-form-item label="管理单位联系人" prop="manageContacts">
        <el-input
          v-model="queryParams.manageContacts"
          placeholder="请输入管理单位联系人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>-->

      <el-form-item label="车牌号码" prop="carcode">
        <el-input
          v-model="queryParams.carcode"
          placeholder="请输入车牌号码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车辆类型" prop="cartype">
        <el-select v-model="queryParams.cartype" placeholder="请选择车辆类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.car_type"
            :key="dict.label"
            :label="dict.label"
            :value="dict.label"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="车辆所在地址" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入车辆所在地址"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="来源" prop="sources">

        <el-select v-model="queryParams.sources" placeholder="请选择来源" clearable size="small">
          <el-option
            v-for="dict in dict.type.car_source"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.car_zt"
            :key="dict.label"
            :label="dict.label"
            :value="dict.label"
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
          v-hasPermi="['nljc:car:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['nljc:car:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="carList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" align="center" prop="sn" :show-overflow-tooltip="true" />
      <el-table-column label="所属区" align="center" prop="subarea" :show-overflow-tooltip="true" />
     <!-- <el-table-column label="权属单位联系人" align="center" prop="belongContacts" :show-overflow-tooltip="true" />
      <el-table-column label="权属单位联系人电话" align="center" prop="belongContactsPhone" :show-overflow-tooltip="true"/>-->
      <el-table-column label="车辆管理单位" align="center" prop="manageUnit" :show-overflow-tooltip="true"/>
    <!--  <el-table-column label="管理单位联系人" align="center" prop="manageContacts" :show-overflow-tooltip="true"/>
      <el-table-column label="管理单位电话" align="center" prop="managePhone" :show-overflow-tooltip="true"/>-->
      <el-table-column label="车牌号码" align="center" prop="carcode" :show-overflow-tooltip="true"/>
      <el-table-column label="车辆类型" align="center" prop="cartype" :show-overflow-tooltip="true"/>
     <!-- <el-table-column label="排水量(m3/h)" align="center" prop="displacement" :show-overflow-tooltip="true"/>-->
      <el-table-column label="车辆所在地址" align="center" prop="location" :show-overflow-tooltip="true"/>
      <el-table-column label="司机姓名" align="center" prop="driver" :show-overflow-tooltip="true"/>
      <el-table-column label="司机电话" align="center" prop="driverPhone" :show-overflow-tooltip="true"/>
      <el-table-column label="计划安装时间" align="center" prop="installPlantime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.installPlantime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="安装车辆地点" align="center" prop="installAddress" :show-overflow-tooltip="true"/>
   <!--   <el-table-column label="安装联系人" align="center" prop="installContacts" :show-overflow-tooltip="true"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="安装联系人电话" align="center" prop="installPhone" :show-overflow-tooltip="true"/>-->
      <el-table-column label="来源" align="center" prop="sourcesnm" :show-overflow-tooltip="true"/>
    <!--  <el-table-column label="经度" align="center" prop="lon" :show-overflow-tooltip="true"/>
      <el-table-column label="维度" align="center" prop="lat" :show-overflow-tooltip="true"/>-->
      <el-table-column label="状态" align="center" prop="status" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['nljc:car:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['nljc:car:remove']"
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

    <!-- 添加或修改抢险车辆对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="序号" prop="sn">
              <el-input-number :min="null" :max="999" v-model="form.sn" placeholder="请输入序号" :precision="0" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属区" prop="subarea">
              <el-input v-model="form.subarea" placeholder="请输入所属区" :maxlength="10"/>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row>
          <el-col :span="12">
            <el-form-item label="权属单位联系人" prop="belongContacts">
              <el-input v-model="form.belongContacts" placeholder="请输入权属单位联系人" :maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权属单位联系人电话" prop="belongContactsPhone">
              <el-input v-model="form.belongContactsPhone" placeholder="请输入权属单位联系人电话" :maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="车辆管理单位" prop="manageUnit">
              <el-input v-model="form.manageUnit" placeholder="请输入车辆管理单位" :maxlength="50"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">

            <el-form-item label="管理单位联系人" prop="manageContacts">
              <el-input v-model="form.manageContacts" placeholder="请输入管理单位联系人"  :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="管理单位电话" prop="managePhone">
              <el-input v-model="form.managePhone" placeholder="请输入管理单位电话" :maxlength="20"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车牌号码" prop="carcode">
              <el-input v-model="form.carcode" placeholder="请输入车牌号码" :maxlength="20"/>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="车辆类型" prop="cartype">
              <el-select v-model="form.cartype" placeholder="请选择车辆类型">
                <el-option
                  v-for="dict in dict.type.car_type"
                  :key="dict.label"
                  :label="dict.label"
                  :value="dict.label"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排水量(m3/h)" prop="displacement">
               <el-input-number :min="null" :max="9999" v-model="form.displacement" placeholder="请输入排水量" :precision="0" :controls="false" ></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="车辆所在地址" prop="location">
              <el-input v-model="form.location" placeholder="请输入车辆所在地址" :maxlength="50"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="司机姓名" prop="driver">
              <el-input v-model="form.driver" placeholder="请输入司机姓名" :maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="司机电话" prop="driverPhone">
              <el-input v-model="form.driverPhone" placeholder="请输入司机电话" :maxlength="20"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划安装时间" prop="installPlantime">
              <el-date-picker clearable size="small"
                              v-model="form.installPlantime"
                              type="datetime"
                              value-format="yyyy-MM-dd HH:mm:ss"
                              placeholder="请选择计划安装时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="安装车辆地点" prop="installAddress">
              <el-input v-model="form.installAddress" placeholder="请输入安装车辆地点"  :maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">

            <el-form-item label="安装联系人" prop="installContacts">
              <el-input v-model="form.installContacts" placeholder="请输入安装联系人" :maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="安装联系人电话" prop="installPhone">
              <el-input v-model="form.installPhone" placeholder="请输入安装联系人电话" :maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="sources">
              <el-select v-model="form.sources" placeholder="请选择来源" clearable size="small">
                <el-option
                  v-for="dict in dict.type.car_source"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="经度" prop="lon">
              <el-input v-model="form.lon" placeholder="请输入经度" :maxlength="20"  />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="维度" prop="lat">
              <el-input v-model="form.lat" placeholder="请输入维度" :maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.car_zt"
                  :key="dict.label"
                  :label="dict.label"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备id" prop="deviceId">
              <el-input v-model="form.deviceId" placeholder="请输入设备id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注"  oninput="if(value.length>200)value=value.slice(0,200)"/>
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
import { listCar, getCar, delCar, addCar, updateCar } from "@/api/nljc/car";

export default {
  name: "QxCar",
  dicts: ['car_type','car_zt','car_source'],
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
      // 抢险车辆表格数据
      carList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sn: null,
        subarea: null,
        unitBelong: null,
        belongContacts: null,
        belongContactsPhone: null,
        manageUnit: null,
        manageContacts: null,
        managePhone: null,
        carcode: null,
        cartype: null,
        displacement: null,
        location: null,
        driver: null,
        driverPhone: null,
        installPlantime: null,
        installAddress: null,
        installContacts: null,
        installPhone: null,
        sources: null,
        lon: null,
        lat: null,
        status: null,
        deviceId: null,
        enable: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sn: [
          { required: true, message: "序号不能为空", trigger: "blur" }
        ],
        carcode: [
          { required: true, message: "车牌号不能为空", trigger: "blur" }
        ],
        location: [
          { required: true, message: "车辆所在地址不能为空", trigger: "blur" }
        ],
        sources: [
          { required: true, message: "来源不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询抢险车辆列表 */
    getList() {
      this.loading = true;
      listCar(this.queryParams).then(response => {
        this.carList = response.rows;
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
        sn: null,
        subarea: null,
        unitBelong: null,
        belongContacts: null,
        belongContactsPhone: null,
        manageUnit: null,
        manageContacts: null,
        managePhone: null,
        carcode: null,
        cartype: null,
        displacement: null,
        location: null,
        driver: null,
        driverPhone: null,
        installPlantime: null,
        installAddress: null,
        installContacts: null,
        remark: null,
        installPhone: null,
        sources: null,
        lon: null,
        lat: null,
        status: "0",
        deviceId: null,
        id: null,
        enable: null
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
      this.title = "添加抢险车辆";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getCar(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改抢险车辆";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCar(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCar(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除车牌号为"' + row.carcode + '"的抢险车辆数据？').then(function() {
        return delCar(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('nljc/car/export', {
        ...this.queryParams
      }, `抢险车辆_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
