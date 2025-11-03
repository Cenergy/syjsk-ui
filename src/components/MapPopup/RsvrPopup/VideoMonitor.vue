<template>
    <div ref="playerRef" :class="['player-wrap', isFullscreen && 'is-fullscreen']">
      <el-row>
        <el-col :span="24">
          <!-- 添加下拉菜单 -->
          <el-select v-model="selectedStcd" placeholder="请选择站点" @change="handleStcdChange" class="dark">
            <el-option
              v-for="item in sxtbh"
              :key="item.stcd"
              :label="item.stnm"
              :value="item.stcd"
            />
          </el-select>
          <HLSPlayer v-if="isHLS" :url="videoUrl"/>
          <LivePlayer v-else :url="videoUrl" />
        </el-col>
      </el-row>
    </div>
  </template>
  <script>
    import { getVideoUrlByIdISAPI, updatePreviewTime } from '@/api/video.js'
    import { yuntaiControlISAPI, lockYunTai, unlockYunTai } from '@/api/yuntai.js'
    import { getStationbystcd } from '@/api/gmfx/tbStation';
    import LivePlayer from '@/components/LivePlayer';
    import HLSPlayer from '@/components/HLSPlayer'
  
    // 配置需要的功能
  
    export default {
      inject: [
        "getStcd"
      ],
      components: {
        LivePlayer,
        HLSPlayer
      },
      props: {
        baseInfo: {
          type: Object,
          default() {
            return {}
          }
        }
      },
      data() {
        return {
          selectedStcd: '', // 用于存储当前选中的 stcd
          stationId: '',
          sxtbh: [], // 从接口获取的站点信息
          channo: '',
          videoUrl: '',
          isHLS: false,
          voiceStatus: true,
          loading: true,
          isCheck: false,
          isFullscreen: false,
          isMouseDown: false,
          isVideoMouseDown: false,
          videoMouseStartPoi: {
            x: 0,
            y: 0
          },
          mouseStartPoi: {
            x: 0,
            y: 0
          },
          controllerPoi: {
            right: "0",
            bottom: "0",
          }
        }
      },
      mounted() {
        let stcd = this.getStcd();
        // let stcd = 'd91decca2b4444e5a601def6f8c4948d';
        getStationbystcd(stcd).then(response => {
          this.sxtbh = response.data
          if (this.sxtbh.length > 0) {
            this.selectedStcd = this.sxtbh[0].stcd; // 默认选中第一个站点
            this.getData(); // 加载视频数据
          }
        });
      },
      methods: {
        getData() {
          this.loading = true
          // let stcd = this.getStcd();
          // let stcd = 'd91decca2b4444e5a601def6f8c4948d';
          getVideoUrlByIdISAPI(this.selectedStcd)
            .then(res => res.msg).then(url => {
            if(url.includes("m3u8")) {
              this.isHLS = true
              this.videoUrl = url.replace('172.21.118.30:83', '192.168.169.145:20211');
            } else {
              // this.videoUrl = url
              this.videoUrl = `ws://${location.host}${url}`;
            }
            this.loading = false;
            this.sendCameraHeart()
          })
        },
        handleStcdChange() {
          // 当用户切换 stcd 时重新获取数据
          this.getData();
        },
        sendCameraHeart() {
          updatePreviewTime(this.selectedStcd)
            .then(res => {
              setTimeout(this.sendCameraHeart, 10000)
            })
        },
        handleMouseDown(direction) {
          yuntaiControlISAPI(this.selectedStcd, direction)
        },
        handleMouseUp() {
          yuntaiControlISAPI(this.selectedStcd, 0)
        },
        yunTaiReset() {
          yuntaiControlISAPI(this.selectedStcd, 0, 0)
        },
        handleFullScreen() {
          if (this.isFullscreen) {
            document.exitFullscreen()
          } else {
            this.$refs.playerRef.requestFullscreen()
          }
        }
      }
    }
  </script>
  <style lang="scss" scoped>.player-wrap {
    width: 100%;
    position: relative;
  }
  
  #player {
    width: 100%;
  }
  
  .controller {
    position: absolute;
    width: 180px;
    // cursor: move;
    opacity: 0.7;
    display: flex;
    flex-direction: column;
    align-items: center;
  
    &:hover {
      opacity: 1;
    }
  
    >div {
      display: flex;
      justify-content: space-between;
      padding: 5px 0px;
    }
  }
  
  .is-fullscreen .controller {
    right: 15px;
    bottom: 15px;
  }
  
  >>>.unset {
    opacity: 0.7;
  }</style>
  