<template>
    <div class="dark-table-wrap" :style="{maxHeight}">
        <table :class="['dark-table', border && 'dark-table-border', size]">
            <thead>
                <tr>
                    <th v-for="(column) of columns"
                    :key="column.prop"
                    :align="column.align || 'center'">{{ column.label }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIdx) of data"
                :key="rowIdx" @click="() => handleRowClick(rowIdx)" >
                    <td v-for="(column, colIdx) of columns"
                    :key="rowIdx+colIdx" v-if="column.prop!=='telCall'">{{ row[column.prop] }}</td>
                    <td v-else>
                        <el-button type="primary" @click="handlceTelCall(row)">呼叫</el-button>
                    </td>
                </tr>
                <tr v-if="data.length === 0">
                    <td :colspan="columns.length">暂无数据</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
export default {
    emits: ["row-click"],
    props: {
        size: {
            type: String,
            default: 'default'
        },
        maxHeight: {
            type: String,
            default: 'auto'
        },
        border: {
            type: Boolean,
            default: false
        },
        columns: {
            type: Array,
            default: () => []
        },
        data: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        handleRowClick(idx) {
            const item = this.data[idx]
            this.$emit("row-click", item)
        },
        handlceTelCall(val){
            // console.log(val,"check")
        }
    }
}
</script>
<style scoped>
.dark-table-wrap {
    overflow: auto;
    /* border: 1px solid #4679AC; */
}
.dark-table-wrap
.dark-table-wrap::-webkit-scrollbar-thumb {
    background-color: #6BA3FD;
}

.dark-table.mini {
    font-size: 12px;
}
.dark-table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    color: rgb(114,114,114,);
    background-color: #ffffff; /* 深蓝色背景，可调整 */
}

.dark-table th,
.dark-table td {
    text-align: center;
    padding: 10px;
   
}
.dark-table td{
      color: #000;
}
/* .dark-table tr {
    border: 1px solid #003366;
} */

.dark-table th {
    background-color: #d9e8f7; /* 浅蓝色表头背景，可调整 */
}

.dark-table tr:hover td {
    background-color: #88a0b8; /* 悬停时行背景色，可调整 */
}

.dark-table.dark-table-border {
    border: 1px solid rgba(113, 183, 244, 0.3);
    th, td {
        border: 1px solid rgba(113, 183, 244, 0.3);
    }
}
</style>