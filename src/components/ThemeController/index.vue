<template>
  <div class="layer-controller-wrapper">
    <div :class="['layer-controller-toggle', expand && 'expand']" @click="handleToggle">
      图层控制
    </div>
    <div v-show="expand" class="layer-controller-panel">
      <zebra-title text="图层信息"></zebra-title>
      <CheckBoxGroup title="水库山塘安全监测" :items="forecastLayerList" @select="handleSelectLayer"></CheckBoxGroup>
      <CheckBoxGroup title="河道海堤安全监测" :items="importantLayerList" @select="handleSelectLayer"></CheckBoxGroup>
      <CheckBoxGroup title="泵站管网安全监测" :items="unionCommandList" @select="handleSelectLayer"></CheckBoxGroup>
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
      forecastLayerList: [
        {
          value: 'ReservoirLvMonitor',
          label: "水库水位"
        }
      ],
      importantLayerList: [
        {
          value: 'RiverLvMonitor',
          label: "河道水位"
        },
        {
          value: 'SeaWallBaseInfo',
          label: "海堤"
        },
      ],
      unionCommandList: [
        {
          value: 'DrainPumpSTNBaseInfo',
          label: "排水泵站"
        },
        {
          value: 'SupplyPumpSTNBaseInfo',
          label: "供水泵站"
        },
        {
          value: 'PSGW',
          label: "排水管网",
          noList: true
        },
        {
          value: 'GsgwWorkMonitor',
          label: "排水管网监测"
        },
      ]
    };
  },
  methods: {
    handleToggle() {
      this.expand = !this.expand;
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

    }
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
