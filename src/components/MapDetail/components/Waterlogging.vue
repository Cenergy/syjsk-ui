<template>
    <div>
        <ZebraTitle style="margin-bottom: 15px;">
            <span style="color: yellow;">查询条件</span>
        </ZebraTitle>
        <el-form
            label-width="80px"
            label-position="right"
            class="dark"
            size="mini"
        >
            <el-form-item label="河道名称">
                <el-input
                v-model="query.keyword"
                placeholder="请输入河道名称"></el-input>
            </el-form-item>
            <el-form-item label-width="0">
                <el-button
                    type="primary"
                    style="width: 100%;"
                    @click="handleSearch"
                >查询</el-button>
            </el-form-item>
        </el-form>
        <ZebraTitle>
            <span style="color: yellow;">水情信息列表(共15条记录，1个测站掉线)</span>
        </ZebraTitle>
        <el-table
            :data="data"
            size="mini"
            class="dark"
            
            @row-click="handleRowClick"
            @row-dblclick="handleRowDblClick"
        >
            <el-table-column
                align="center"
                label="河流名称"
                prop="rvName"
            ></el-table-column>
            <el-table-column
                align="center"
                label="河流长度(km)"
                prop="rvLen"
            ></el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            query: {
                hdnm: '',
                keyword: ''
            },
            data: [],
            rawData: []
        };
    },
    methods: {
        getData() {
            // getRiverList()
            //     .then(res => {
            //         // console.log(res.data)
            //         this.rawData = res.data
            //         this.data = res.data
            //     })
        },
        isOver(row) {
            if(row.xxsw === null
            && row.xxsw === undefined) {
                return false
            }
            return row.rz >= row.xxsw
        },
        handleSearch() {
            const { keyword } = this.query
            this.data = this.rawData.filter(item=>{
                return item.rvName.includes(keyword)
            })
        },
        handleRowClick(row) {
            // const row = this.data[idx]
            this.$bus.emit("mapLocate", {
                type: 'River',
                data: row
            });
        },
        handleRowDblClick(row) {
            this.$bus.emit("openMapDialog", {
                handleField: 'rvCode',
                titleField: 'rvName',
                type: 'River',
                data: row
            });
        }
    },
    created() {
        this.getData();
    }
};
</script>

<style scoped></style>