import BaseLayer from "./baseLayer";
import * as echarts from "echarts";
import { cesiumUseEcharts } from "./echartsHelper";

class EchartsLayer extends BaseLayer {
  static cesiumUseEcharts = cesiumUseEcharts;
  constructor(options = {}) {
    super(options);
    this._container = null;
    this._isRegistered = false;
    this.chartEntity = null;
    this.requestAnimationID = null;
  }

  async show() {
    const { viewer } = this;
    const otherPoints = [
      [113.901158030000033, 22.801234018000059],
      [113.901545056000032, 22.802526058000069],
      [113.903640605000078, 22.803379996000047],
      [113.905026158000055, 22.80226785800005],
      [113.902499727000077, 22.80100531000005],
      [113.902126815000088, 22.798965145000068],
      [113.900303402000077, 22.797588356000063],
      [113.899751857000069, 22.79795286600006],
      [113.898925746000032, 22.798143405000076],
      [113.89978359700001, 22.799370866000061],
      [113.900819016000014, 22.799704661000078],
      [113.901158030000033, 22.801234018000059],
    ];
    const centerPoint = [113.903246, 22.802953];
    //插值，获取更多的飞线
    function addMorePoints(pointsGroup, minPointsPerEdge) {
      if (!pointsGroup || pointsGroup.length < 3) return pointsGroup;
      const result = [];
      for (let i = 0; i < pointsGroup.length; i++) {
        const start = pointsGroup[i];
        const end = pointsGroup[(i + 1) % pointsGroup.length];
        // 添加起点
        result.push(start);
        // 计算两点之间的距离
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        // 计算需要插入的点数（减去起点和终点）
        const pointsToAdd = Math.max(0, minPointsPerEdge - 2);
        // 在两点之间线性插值
        for (let j = 1; j <= pointsToAdd; j++) {
          const ratio = j / (pointsToAdd + 1);
          const newX = start[0] + dx * ratio;
          const newY = start[1] + dy * ratio;
          result.push([newX, newY]);
        }
      }

      return result;
    }
    //避免飞线从顶点出发导致跨越多边形
    function calotherPoints(point, centerPoint, ratio) {
      var x = centerPoint[0] + ratio * (point[0] - centerPoint[0]);
      var y = centerPoint[1] + ratio * (point[1] - centerPoint[1]);
      return [x, y];
    }
    const otherMorePoints = addMorePoints(otherPoints, 25);
    //数据转化为线段所需
    const convertData = function (data, centerPoint) {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        const toCoord = centerPoint;
        if (toCoord) {
          res.push([
            {
              coord: data,
              value: 50,
            },
            {
              coord: toCoord,
            },
          ]);
        }
      }
      return res;
    };
    const series = [];
    //加飞线
    otherMorePoints.forEach(function (data) {
      var fakePoint = calotherPoints(
        data,
        centerPoint,
        Math.random() * 0.3 + 0.4
      );
      series.push(
        //飞线
        {
          type: "lines",
          coordinateSystem: "GLMap",
          zlevel: 100,
          effect: {
            show: true,
            period: Math.floor(Math.random() * 10) + 20, // 图标飞跃速度，值越小速度越快
            trailLength: 0.5, // 尾迹长度[0,1]值越大，尾迹越长
            symbol: "pin", // 图标类型
            symbolSize: [1.5, Math.floor(Math.random() * 50) + 10], // 图标大小
            color: "rgba(88, 179, 179, 0.9)", // 图标颜色
            animation: false,
            loop: true, // 是否循环显示
          },
          lineStyle: {
            normal: {
              show: true,
              width: 1, //尾迹线条宽度
              opacity: 0, //尾迹线条透明度
              curveness: 0.1, //尾迹线条曲直度
            },
          },
          data: convertData(fakePoint, centerPoint),
        }
      );
    });
    //集中点
    series.push({
      type: "effectScatter",
      coordinateSystem: "GLMap",
      showEffectOn: "render",
      zlevel: 2,
      rippleEffect: {
        period: 20, // 动画时间，值越小速度越快
        brushType: "fill", // 波纹绘制方式 stroke, fill
        scale: 6, // 波纹圆环最大限制，值越大波纹越大
        color: "rgba(0,255,255,0.5)",
      },
      itemStyle: {
        normal: {
          show: false,
          color: "#00BFFF",
        },
      },
      symbol: "circle",
      symbolSize: function (val) {
        return 15; //圆环大小
      },
      data: [
        {
          name: "集中点",
          value: centerPoint,
        },
      ],
    });
    var option = {
      animation: !1,
      GLMap: {},
      series: series,
    };
    this.chartEntity = cesiumUseEcharts(viewer, option);
    //若高度超过或低于该值，则隐藏掉
    const watchDistance = () => {
      const targetPosition = Cesium.Cartesian3.fromDegrees(
        centerPoint[0],
        centerPoint[1],
        0
      );
      var cameraPosition = viewer.camera.position;
      const distance = Cesium.Cartesian3.distance(
        cameraPosition,
        targetPosition
      );
      if (distance > 2000 || distance < 600) {
        this.chartEntity.hide();
      } else {
        this.chartEntity.show();
      }
      this.requestAnimationID = window.requestAnimationFrame(watchDistance);
    };

    watchDistance();
  }
  hide() {
    const {viewer} = this;
    if (this.chartEntity) {
      this.chartEntity.dispose();
      this.chartEntity = null;
    }
    if (this.requestAnimationID) {
      window.cancelAnimationFrame(this.requestAnimationID);
    }
  }
}
export default new EchartsLayer();
