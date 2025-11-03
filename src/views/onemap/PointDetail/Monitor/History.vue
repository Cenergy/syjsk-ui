<template>
  <el-table
    :data="tableData"
    border
    style="width: 100%"
  >
    <el-table-column
      label="街道"
      prop="street"
      align="center"
    />
    <el-table-column
      label="社区"
      prop="community"
      align="center"
    />
    <el-table-column
      label="积水位置"
      prop="waterLocation"
      align="center"
    />
    <el-table-column
      label="积水程度（积涝点、积水点）"
      prop="waterDegree"
      align="center"
    />
    <el-table-column
      label="积水面积（㎡）"
      prop="waterArea"
      align="center"
    />
    <el-table-column
      label="积水深度（cm）"
      prop="waterDepth"
      align="center"
    />
    <el-table-column
      label="积水开始时间"
      prop="startTime"
      align="center"
    />
    <el-table-column
      label="积水消退时间"
      prop="endTime"
      align="center"
    />
    <el-table-column
      label="积水消退时长（h）（雨停后积水消退时长）"
      prop="recedeTime"
      align="center"
    />
    <el-table-column
      label="详细积水原因"
      prop="reason"
      align="center"
    />
    <el-table-column
      label="已采取措施"
      prop="measures"
      align="center"
    />
    <el-table-column
      label="值守照片"
      prop="dutyPhoto"
      align="center"
    />
    <el-table-column
      label="积水照片"
      prop="waterPhoto"
      align="center"
    />
    <el-table-column
      label="积水消退照片"
      prop="recedePhoto"
      align="center"
    />
    <el-table-column
      label="现场联系人"
      prop="contactPerson"
      align="center"
    />
    <el-table-column
      label="联系电话"
      prop="contactTel"
      align="center"
    />
  </el-table>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          index: 4,
          street: '公明街道',
          community: '上村社区',
          waterLocation: '上村莲塘龙大高速桥底',
          waterDegree: '积水点',
          waterArea: 300,
          waterDepth: 25,
          startTime: '11:40',
          endTime: '13:38',
          recedeTime: 0.3,
          reason: '1. 桥底地势极为下洼，而且坡度较陡。桥底最低地面高程6.82m，临近南侧路面高程7.28m，北侧路面高程8.02m，降雨期间两边汇水快速向桥底汇集。 2. 周边汇水面积较大且缺乏雨水系统。目前丰颂路龙大高速桥南段已有排水系统将汇水排向茅洲河方向；但北侧汇水缺失排水系统，汇水面积17.5公顷，汇水沿路面向低洼处排泄。 3. 西田水降雨期间水位较高，排水不畅。龙大高速桥两侧均有排水沟接入西田水。西田水龙大高速桥断面常水位5.48m，50年一遇洪水位7.8m，20年一遇洪水位7.35m，降雨量较少时可以通过两侧自排，但强降雨期间受河水顶托导致排水不畅甚至倒灌。',
          measures: '现场做好安全围挡，两台各150m³的抽水泵泵会自动抽排；一辆500m³的泵车，水带20米，通过北侧箱涵倒排至L015a排口，最终排入西田水，并安排人员现场值守。',
          dutyPhoto: '', // 实际可存图片地址等，这里先空着
          waterPhoto: '',
          recedePhoto: '',
          contactPerson: '李俊杰', // 需按实际补充
          contactTel: '18038087823' // 需按实际补充
        },
        {
          index: 4,
          street: '公明街道',
          community: '上村社区',
          waterLocation: '丰硕路龙大高速桥底',
          waterDegree: '积水点',
          waterArea: 200,
          waterDepth: 30,
          startTime: '8:05',
          endTime: '8:52',
          recedeTime: "47",
          reason: '瞬时雨量过大',
          measures: '启用泵车抽排',
          dutyPhoto: '', // 实际可存图片地址等，这里先空着
          waterPhoto: '',
          recedePhoto: '',
          contactPerson: '杨祖宴', // 需按实际补充
          contactTel: '15089467346' // 需按实际补充
        }
      ]
    }
  }
}
</script>

<style scoped>
/* 可根据需要自定义表格样式 */
</style>