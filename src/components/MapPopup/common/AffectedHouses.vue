vue
<template>
  <div class="affected-houses">
    <div class="title">受影响民房信息</div>
    <table class="ah-table">
      <tbody>
        <tr v-for="(value, key) in data" :key="key" v-if="excludeFields.indexOf(key) === -1">
          <th class="ah-key">{{ housesLabel[key] || key }}</th>
          <td class="ah-value">{{ formatValue(value) + (unitsObject[key] || '') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AffectedHouses',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
        excludeFields: [
            "OBJECTID","wz","xz"
        ],
        housesLabel:{
            "hsx":"受影响水位",
            "OBJECTID":"对象ID",
            "RefName":"所属乡镇",
            "hzm":"户主姓名",
            "ssc":"所属村",
            "fwwz":"房屋地址",
            "czrk":"常住人口",
            "lxdh":"联系方式",
        },
        unitsObject:{
            "hsx":"米",
        }
    }
  },
  methods: {
    formatValue(v) {
      if (v === null || v === undefined) return '';
      return String(v);
    }
  }
}
</script>

<style scoped>
.affected-houses {
  color: #fff;
}
.title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #50beff;
}
.ah-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}
.ah-table tr {
  border-bottom: 1px solid #335c94;
}
.ah-key {
  width: 40%;
  text-align: left;
  padding: 6px 8px;
  color: #9fd3ff;
  font-weight: 500;
}
.ah-value {
  padding: 6px 8px;
  color: #e6f1ff;
  word-break: break-all;
}
</style>