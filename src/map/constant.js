// 三维视角
const tflyToData = {
  destination: {
    x: -2381165.437630431,
    y: 5230762.971550673,
    z: 2762721.593695167,
  },
  orientation: {
    heading: 5.039979928407654,
    pitch: -0.12549998985640953,
    roll: 0.00009946957517126265,
  },
};
// 二维视角
const sflyToData = {
  destination: {
    x: -2381356.00873272,
    y: 5276315.485355784,
    z: 2786366.495095142,
  },
  orientation: {
    heading: 4.96260186293147,
    pitch: -1.5706941914217185,
    roll: 0,
  },
};
// 视角map
const VIEW_SETTINGS_MAP = new Map([
  ["三维全景", tflyToData],
  ["二维全域", sflyToData],
]);

// 默认视角
const DEFAULT_VIEW_INFO = tflyToData;

// 模型列表
const MODEL_3DTILES_INFO_LIST = [
  {
    name: "营前镇",
    center: [114.28588725407956, 25.922805302869802, 150], // 模型纠偏位置
    postion: [114.28946781265908, 25.926791091608518], // 点位标注中心
    flyToData: {
      destination: {
        x: -2363662.01448374,
        y: 5232311.304850143,
        z: 2770272.8201225647,
      },
      orientation: {
        heading: 5.458459827020796,
        pitch: -0.14823566961047518,
        roll: 0.000030021807740254758,
      },
    },
  },
  {
    name: "果木村",
    center: [114.17722276999999, 25.743288721999994, 0],
    postion: [114.19409004855454, 25.744386604141457],
    flyToData: {
      // destination: {
      //   x: -2356023.0285521764,
      //   y: 5242942.229759408,
      //   z: 2756499.23604951,
      // },
      destination: {
        x: -2356732.8605104457,
        y: 5245571.909146348,
        z: 2753726.9905538773,
      },

      orientation: new Cesium.CallbackProperty(function () {
        return Cesium.Transforms.headingPitchRollQuaternion(
          viewer.camera.position,
          new Cesium.HeadingPitchRoll(0.0, -Math.PI / 2, 0.0)
        );
      }, false),
      // orientation: {
      // heading: 3.3726323967365204,
      // pitch: -0.21280825155238148,
      // roll: 6.283183829219863,
      // },
    },
  },
  {
    name: "过埠镇",
    center: [114.199969495, 25.765205621000003, 0],
    postion: [114.21800744628167, 25.754925269539907],
    flyToData: {
      destination: {
        x: -2360281.8299946846,
        y: 5243199.253728833,
        z: 2753344.307854071,
      },
      orientation: {
        heading: 5.581068125642169,
        pitch: -0.1620939787421587,
        roll: 6.283160021886346,
      },
    },
  },
  {
    name: "河梅村",
    center: [114.22888187572039, 25.793636250885837, 0],
    postion: [114.22888187572039, 25.793636250885837],
    flyToData: {
      destination: {
        x: -2359144.3677335484,
        y: 5240816.90945893,
        z: 2757514.541804226,
      },
      orientation: {
        heading: 5.932846963081119,
        pitch: -0.09979169964206691,
        roll: 0.000006051929970496417,
      },
    },
  },
  {
    name: "杰坝乡",
    center: [114.26933198172986, 25.839026424585195, 0],
    postion: [114.27120198172986, 25.834166424585195],
    flyToData: {
      destination: {
        x: -2362264.193262877,
        y: 5237709.428261508,
        z: 2761166.7267465405,
      },
      orientation: {
        heading: 5.948829336014486,
        pitch: -0.12191523321607356,
        roll: 0.00003198124260794799,
      },
    },
  },
  {
    name: "龙下村",
    center: [114.312820103, 25.914877946999997, 0],
    postion: [114.31602079387898, 25.911017756752823],
    flyToData: {
      destination: {
        x: -2363791.1483108327,
        y: 5232698.101370196,
        z: 2769735.6823498416,
      },
      orientation: {
        heading: 0.5930053820599612,
        pitch: -0.3846411119478996,
        roll: 6.28316864350151,
      },
    },
  },
  {
    name: "水岩乡",
    center: [114.347821896, 25.948270538, 0],
    postion: [114.3334155036952, 25.967414295877674],
    flyToData: {
      destination: {
        x: -2364575.5037906775,
        y: 5228667.009322487,
        z: 2775279.904647736,
      },
      orientation: {
        heading: 5.9579370597453165,
        pitch: -0.09766414281171043,
        roll: 6.28318431596369,
      },
    },
  },
];
const EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT = [
  {
    id: 1984,
    value: 198.4,
    color: "blue",
    alpha: 0.5,
    include: true,
    label: "正常蓄水位",
    checked: true,
  },
  { id: 1990, value: 199.0, color: "#FFFF00", alpha: 0.5, label: "199.0" },
  { id: 1995, value: 199.5, color: "#FFBF00", alpha: 0.5, label: "199.5" },
  { id: 2000, value: 200.1, color: "orange", alpha: 0.5, label: "200.1" },
  { id: 2006, value: 200.6, color: "red", alpha: 0.5, label: "汛限水位" },
];
export {
  MODEL_3DTILES_INFO_LIST,
  VIEW_SETTINGS_MAP,
  DEFAULT_VIEW_INFO,
  EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
};
