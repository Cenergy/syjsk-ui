<template>
    <dark-card title="内涝水情">
        <template #icon>
            <img src="@/assets/icons/png/partTitleIcon.png" alt="">
        </template>
        <div style="display: flex; justify-content: center; padding: 10px 0;align-items: center;">
            <!-- <div>
                    <el-progress type="dashboard"
                    :percentage="10"
                    :stroke-width="15"
                    color="#2e6598"
                    stroke-linecap="square"
                    text-color="#FFF"
                    define-back-color="#FFFFFF10"></el-progress>
                    <div style="text-align: center;">水库</div>
                </div>
                <div>
                    <el-progress type="dashboard"
                    :percentage="10"
                    :stroke-width="15"
                    color="#2e6598"
                    stroke-linecap="square"
                    text-color="#FFF"
                    define-back-color="#FFFFFF10"></el-progress>
                    <div style="text-align: center;">河道</div>
                </div> -->
            <div style="margin: 0 15px;">
                <el-progress type="dashboard" :percentage="precent" :stroke-width="15" :format="precentFmt"
                    color="#2e6598" stroke-linecap="square" text-color="#000" define-back-color="#87CEFA"></el-progress>
                <div style="text-align: center;">积涝点</div>
            </div>
            <div class="calpanel">

                <div class="item" style="background: rgba(48 ,115, 115 , 0.2);">
                    <div class="title">
                        <div class="rect" style="background: rgb(75, 129, 255);"></div>
                        <span>积水深度15到27cm</span><br>
                    </div>
                    <span style="ont-size: 20px;font-weight: 600;">0个</span>
                </div>
                <div class="item" style="background: rgba(255, 168,0,0.2);">

                    <div class="title">
                        <div class="rect" style="background: rgb(255, 168,0);"></div>
                        <span>积水深度27到50cm</span><br>
                    </div>
                    <span style="ont-size: 20px;font-weight: 600;">0个</span>
                </div>
                <div class="item" style="background: rgba(255, 0,0,  0.2);">

                    <div class="title">
                        <div class="rect" style="background: rgb(239,81,76)"></div>
                        <span>积水深度27到50cm</span><br>
                    </div>
                    <span style="ont-size: 20px;font-weight: 600;">0个</span>
                </div>
            </div>


        </div>
        </div>
    </dark-card>
</template>
<script>
import { getIndexGjsq } from '../../api/nljc';

export default {
    data() {
        return {
            data: {}
        };
    },
    methods: {
        getData() {
            getIndexGjsq().then(res => {
                this.data = res.data;
            })
        },
        precentFmt() {
            // return `${this.data.gjs}/${this.data.zs}`
            return `0/148`
        }
    },
    computed: {
        precent() {
            if (this.data.zs) {
                return (this.data.gjs / this.data.zs) * 100;
            } else {
                return 0;
            }
        }
    },
    mounted() {
        this.getData();
    }
}
</script>
<style scoped>
.calpanel {
    margin: 0 15px;

    .item {
        text-align: center;
        text-align: center;
        /* background: rgba(0, 255, 255, 0.2); */
        padding: 10px;
        border: 1px solid #CCC;
        border-radius: 10px;
        margin: 10px 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .title {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .rect {
            width: 12px;
            height: 12px;
            margin-right: 5px;
        }
    }
}
</style>