<template>
    <div class="layer-controller-wrapper">
      <div :class="['layer-controller-toggle', expand && 'expand']" @click="handleToggle">
        专题图
      </div>
      <div v-show="expand" class="layer-controller-panel">
        <zebra-title text="专题信息"></zebra-title>
        <CheckBoxGroup title="水库分布专题图" :items="forecastLayerList" @select="handleSelectLayer"></CheckBoxGroup>
        <CheckBoxGroup title="河道分布专题图" :items="importantLayerList" @select="handleSelectLayer"></CheckBoxGroup>
        <CheckBoxGroup title="泵站分布专题图" :items="unionCommandList" @select="handleSelectLayer"></CheckBoxGroup>
        <CheckBoxGroup title="管网分布专题图" :items="waterProjectList" @select="handleSelectLayer"></CheckBoxGroup>
        <CheckBoxGroup title="海堤分布专题图" :items="workLayerList" @select="handleSelectLayer"></CheckBoxGroup>
        <CheckBoxGroup title="山塘分布专题图" :items="baseWaterrList" @select="handleSelectLayer"></CheckBoxGroup>
        <CheckBoxGroup title="水闸分布专题图" :items="sluiceList" @select="handleSelectLayer"></CheckBoxGroup>
      </div>
    </div>
  </template>
  <script>
  import CheckBoxGroup from './CheckBoxGroup.vue';
  
  export default {
    // emits: ["checkboxChange"],
    components: {
      CheckBoxGroup
    },
    data() {
      return {
        expand: false,
        baseWaterrList: [
          // {
          //   value: 'ReservoirBaseInfo',
          //   label: "水库",
          // },
          // {
          //   value: 'RiverBaseInfo',
          //   label: "河道",
          //   // noList: true
          // },
          // {
          //   value: 'WaterPPBaseInfo',
          //   label: "水质净化厂"
          // },
          // {
          //   value: 'DrainPumpSTNBaseInfo',
          //   label: "排水泵站"
          // },
          // {
          //   value: 'SupplyPumpSTNBaseInfo',
          //   label: "供水泵站"
          // },
          // {
          //   value: 'WaterGateBaseInfo',
          //   label: "水闸"
          // },
          // {
          //   value: 'SeaWallBaseInfo',
          //   label: "海堤"
          // },
          // {
          //   value: 'WaterWorkBaseInfo',
          //   label: "水厂"
          // },
          // {
          //   value: 'PSGW',
          //   label: "排水管网",
          //   noList: true
          // },
          // {
          //   value: 'GSGW',
          //   label: "供水管网"
          // },
          {
            value: 'SluiceQuality',
            label: "山塘",
          },
        ],
        sluiceList:[
          {
            value: 'WaterGateBaseInfo',
            label: "水闸"
          },
        ],
        forecastLayerList: [
          {
            value: 'ReservoirLvMonitor',
            label: "水库水位"
          },
          // {
          //   value: 'RiverLvMonitor',
          //   label: "河道水位"
          // },
          // {
          //   value: 'RainLvMonitor',
          //   label: "雨量监测"
          // }
        ],
        importantLayerList: [
          // {
          //   value: 'RiverQuality',
          //   label: "河道水质"
          // },
          // {
          //   value: 'PsgwQuality',
          //   label: "排水管网水质"
          // },
          // {
          //   value: 'RsvrQuality',
          //   label: "水库水质"
          // },
          {
            value: 'RiverLvMonitor',
            label: "河道水位"
          },
        ],
        unionCommandList: [
          // {
          //   value: 'DamMonitor',
          //   label: "大坝监测"
          // },
          // {
          //   value: 'SeaWallGNSSMonitor',
          //   label: "海堤GNSS变形"
          // }
          {
            value: 'DrainPumpSTNBaseInfo',
            label: "排水泵站"
          },
        ],
        waterProjectList: [
          // {
          //   value: 'AllVideoMonitor',
          //   label: "视频监控"
          // }
          {
            value: 'GsgwWorkMonitor',
            label: "排水管网监测"
          },
          {
            value: 'PSGW',
            label: "排水管网",
            noList: true
          },
        ],
        workLayerList: [
          // {
          //   value: 'RsvrStorage',
          //   label: "水库水量"
          // },
          // {
          //   value: 'GsgwWorkMonitor',
          //   label: "排水管网监测"
          // },
          // {
          //   value: 'WaterWorkStorage',
          //   label: "供水厂监测"
          // }
          {
            value: 'SeaWallGNSSMonitor',
            label: "海堤GNSS变形"
          },
          {
            value: 'SeaWallBaseInfo',
            label: "海堤"
          },
        ]
      };
    },
    methods: {
      handleToggle() {
        this.expand = !this.expand;
        this.$emit('toggle-asides');
      },
      open() {
        this.expand = true;
      },
      close() {
        this.expand = false;
      },
      handleSelectLayer(isSelected, item) {
        if (isSelected) {
          if(!item.noList) {
            this.$bus.emit("addMapDetail", item);
          }
          this.$bus.emit("addMapLayer", item);
        } else {
          this.$bus.emit("removeMapLayer", item);
          this.$bus.emit("removeMapDetail", item.value);
        }
      },
      handleSelectLayer2(isSelected, item) {
  
      },
    }
  };
  </script>
  <style lang="scss" scoped>
  .layer-controller-wrapper {
    position: absolute;
    top: 10px;
    left: 50px;
    z-index: 100;
  }
  
  .layer-controller-toggle {
    user-select: none;
    padding: 8px 15px;
    border-radius: 4px;
    /* background-color: #123A62E8; */
    background: url("./background.png") 100% 100%;
    color: white;
    cursor: pointer;
  
    &.expand {
      color: yellow;
      /* outline: 3px solid #2DA6FC; */
    }
  }
  
  .layer-controller-panel {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 370px;
    border-radius: 4px;
    padding: 10px;
    background-color: rgba(13, 43, 61, 0.8);
    color: white;
  }
  
  .subtitle {
    color: yellow;
    border-left: 3px solid #8CC6FF;
    padding-left: 10px;
  }
  </style>
  