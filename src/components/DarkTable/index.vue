<template>
    <div class="dark-table-wrap" :style="{maxHeight}">
        <table :class="['dark-table', border && 'dark-table-border', size]">
            <slot></slot>
        </table>
    </div>
</template>
<script>
export default {
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
    color: white;
    background-color: #003366; /* 深蓝色背景，可调整 */
}

.dark-table th,
.dark-table td {
    text-align: center;
    padding: 10px;
}

.dark-table tr {
    border: 1px solid #003366;
}

.dark-table th {
    background-color: #0066cc; /* 浅蓝色表头背景，可调整 */
}

.dark-table tr:hover {
    background-color: #004c99; /* 悬停时行背景色，可调整 */
}

.dark-table.dark-table-border th,
.dark-table.dark-table-border td {
    border: 1px solid #003366;
}
</style>