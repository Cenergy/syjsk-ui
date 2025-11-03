<template>
  <div>
    <el-form class="dark" inline>
      <!-- <el-form-item
        label="告警项">
        <el-select v-model="queryParams.factorName" clearable class="dark">
          <el-option
            v-for="item in itemList"
            :value="item"
            :label="item"
            :key="item">
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item
        label="告警时间">
        <el-date-picker
          key="date"
          class="dark"
          popper-class="dark"
          v-model="dtrange"
          type="daterange"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button class="dark" @click="getList">查询</el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-table
        border
        :data="recordList"
        class="dark">
        <el-table-column
          align="center"
          label="编号"
          type="index"></el-table-column>
        <el-table-column
          align="center"
          prop="gjx"
          label="告警项"></el-table-column>
          <el-table-column
          align="center"
          prop="jcz"
          label="监测值"></el-table-column>
        <el-table-column
          align="center"
          prop="bzz"
          label="警戒值"></el-table-column>
          <el-table-column
          align="center"
          prop="warningTime"
          label="告警时间"></el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        dark
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>
<script>

  export default {
    inject: ['getStcd'],
    data() {
      const GAP = 180 * 86400 * 1000
      const endTime = new Date()
      const beginTime = new Date(endTime - GAP)
      return {
        dtrange: [parseTime(beginTime, '{y}-{m}-{d}'), parseTime(endTime, '{y}-{m}-{d}')],
        // 遮罩层
        loading: true,
        // 总条数
        total: 0,
        // 人工河道水质数据告警记录表格数据
        riverWqWarningList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          sectionCode: null,
          factorName: null,
          factorStandard: null,
          factorValue: null,
          dt: null,
          beginTime: null,
          endTime: null
        },
        itemList:[
          '氨氮',
          '化学需氧量',
          '溶解氧',
          '氟化物',
          '总磷',
          '阴离子表面活性剂',
          '氧化还原电位',
        ]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      /** 查询人工河道水质数据告警记录列表 */
      getList() {
        this.loading = true
        this.queryParams.stcd = this.getStcd()
        this.queryParams.beginTime = this.dtrange[0],
        this.queryParams.endTime = this.dtrange[1],
        listWarningEachH(this.queryParams).then(response => {
          this.recordList = response.rows
          this.total = response.total
          this.loading = false
        })
      }
    }
  }
</script>
<style scoped>

</style>
