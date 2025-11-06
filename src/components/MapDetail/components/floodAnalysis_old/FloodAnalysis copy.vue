<template>
  <div style="display: flex; flex-direction: column; height: calc(100vh - 165px)">
    <ZebraTitle style="margin-bottom: 15px">
      <span
        style="
          font-family: Source Han Sans CN;
          font-weight: 700;
          font-size: 16px;
          line-height: 28px;
          letter-spacing: 0%;
          color: rgba(60, 83, 104, 1);
        "
        >查询条件</span
      >
    </ZebraTitle>
    <el-form label-width="80px" label-position="right" size="mini">
      <el-form-item label="当前水位">
       <el-input v-model="query.value" placeholder="请输入关键字" style="width: 100%"/>
      </el-form-item>
      <el-form-item label="上升水位">
        <el-input v-model="query.ll" placeholder="请输入关键字" style="width: 100%"/>
      </el-form-item>
      <el-form-item label-width="0" style="display: flex; justify-content: center">
        <el-button type="primary" style="width: 150px" @click="handleSearch"
          >开始预演</el-button
        >
      </el-form-item>
    </el-form>
    <ZebraTitle>
      <span
        style="
          font-family: Source Han Sans CN;
          font-weight: 700;
          font-size: 16px;
          line-height: 28px;
          letter-spacing: 0%;
          color: rgba(60, 83, 104, 1);
        "
        >影响区域列表(共{{ data.length }}条记录)</span
      >
    </ZebraTitle>
    <div
      class="tableContainer"
      style="flex: 1; overflow: hidden; display: flex; flex-direction: column"
    >
      <el-table :data="data" size="mini" height="100%" @row-click="handleRowClick">
        <el-table-column
          align="center"
          width="150"
          label="名称"
          prop="name"
        ></el-table-column>
        <el-table-column
          align="center"
          width="80"
          label="水深(m)"
          prop="rz"
        ></el-table-column>
        <el-table-column
          align="center"
          width="80"
          label="警戒水深(m)"
          prop="jjsw"
        ></el-table-column>
        <el-table-column
          align="center"
          width="150"
          label="影响区域"
          prop="area"
        ></el-table-column>
        <el-table-column
          align="center"
          width="150"
          label="所属社区"
          prop="social"
        ></el-table-column>
        <el-table-column
          align="center"
          width="50"
          label="积水深度(m)"
          prop="depth"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: {
        hdnm: "",
        keyword: "",
        value:50,
        ll:20,
        sw:30
      },
      data: [],
      rawData: [],
      checkboxList:[]
    };
  },
  methods: {
    getData() {
        const res={data: []} // await getWaterLoggingPointBaseInfo();
      this.rawData = res.data;
      this.data = res.data;
      //temp
      let tempData = [];
      tempData = tempData.map((item) => {
        item.rz = 0;
        item.jjsw = 0.15;
        return item;
      });
      this.data.push(...tempData);
      // getRiverList()
      //     .then(res => {
      //         // console.log(res.data)
      //         this.rawData = res.data
      //         this.data = res.data
      //     })
    },
    isOver(row) {
      if (row.jjsw === null && row.jjsw === undefined) {
        return false;
      }
      return row.rz >= row.jjsw;
    },
    handleSearch() {
      const { keyword } = this.query;
      this.data = this.rawData.filter((item) => {
        return item.name.includes(keyword);
      });
    },
    handleRowClick(row) {
      // const row = this.data[idx]
      this.$bus.emit("mapLocate", {
        type: "River",
        data: row,
      });
    },
    handleRowDblClick(row) {
      this.$bus.emit("openMapDialog", {
        handleField: "rvCode",
        titleField: "rvName",
        type: "River",
        data: row,
      });
    },
  },
  created() {
    this.getData();
  },
};
</script>

<style scoped></style>
