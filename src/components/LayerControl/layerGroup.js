const layerGroup = {
  layerGuideLine: [
    {
      value: "administrativeLayer",
      label: "行政区划",
      flag: false,
    },
    {
      value: "terrainLayer",
      label: "地形数据",
      flag: true,
    },
    {
      value: "cloudImage",
      label: "卫星云图",
      flag: false,
    },
    {
      value: "tilesetModelAccuracy",
      label: "倾斜摄影",
      flag: true,
    },
    // {
    //   value: "riverLayer",
    //   label: "河流水系",
    //   flag: false,
    // },
    // {
    //   value: "weather",
    //   label: "降雨效果",
    //   flag: false,
    // },
    {
      value: "watershedLayer",
      label: "流域范围",
      flag: false,
    },
    {
      value: "extractionPointsLayer",
      label: "安置点位",
      flag: false,
    },
    {
      value: "affectedHousesLayer",
      label: "房屋影响",
      showDetail: true,
      isOpen: false,
      flag: false,
    },
    // {
    //   value: "waterLayer",
    //   label: "模拟水位",
    //   flag: false,
    // },
  ],
};
export default layerGroup;
export {layerGroup}
