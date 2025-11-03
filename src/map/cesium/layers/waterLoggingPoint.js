import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";

class waterLoggingPoint extends BaseLayer {
  constructor(options) {
    // 调用父类的构造函数，并传入参数options
    super(options);
    // 初始化legend对象，包含label和url属性
    this.legend = {
      label: "积涝点",
      url: styles.riverIcon.options.iconUrl,
    };
    this.waterLoggingPointEntity = [];
  }
  async show() {
    const { viewer, id } = this;
    var heightValue = 10;
    this.setLegend(); //设置图例
    if (this.hasLoaded) {
      //显示entity
      if (
        this.waterLoggingPointEntity &&
        this.waterLoggingPointEntity.length > 0
      ) {
        this.waterLoggingPointEntity.forEach((entity) => {
          entity.show = true;
        });
      }
      return;
    }
    //请求接口数据
    const { code, data } = await request.getWaterLoggingPointList();
    if (code !== 200 || !data.length) return;
    //去重复stcd对象
    var uniqueData = [];
    var stcdList = [];
    for (var item of data) {
      if (!stcdList.includes(item.stcd)) {
        uniqueData.push(item);
        stcdList.push(item.stcd);
      }
    }
    const tempData = [
      {
        stcd: "812B2001",
        name: "福田区滨河皇岗立交桥洞(市)",
        x: 114.06742,
        y: 22.544503,
      },
      {
        stcd: "812B2002",
        name: "福田区广深高速桥下滨海大道北侧辅道(市)",
        x: 114.01163,
        y: 22.530986,
      },
      {
        stcd: "812B2003",
        name: "福田区福田区竹子林立交下穿通道(市)",
        x: 114.012404,
        y: 22.530617,
      },
      {
        stcd: "812B2004",
        name: "福田区滨河益田立交桥洞(市)",
        x: 114.051822,
        y: 22.532121,
      },
      {
        stcd: "812B2005",
        name: "罗湖区春风隧道东侧出口(市)",
        x: 114.135403,
        y: 22.548624,
      },
      {
        stcd: "812B2006",
        name: "福田区北环新洲立交东南角辅道(市)",
        x: 114.042194,
        y: 22.564544,
      },
      {
        stcd: "812B2008",
        name: "宝安区洲石路鹤洲桥底(市)",
        x: 113.857671,
        y: 22.625624,
      },
      {
        stcd: "812B2009",
        name: "宝安区帝堂路（锦程路以西段）(市)",
        x: 113.77935,
        y: 22.749314,
      },
      {
        stcd: "812B2010",
        name: "宝安区上星南路与中心路丽沙花都(市)",
        x: 113.82297,
        y: 22.718027,
      },
      {
        stcd: "812B2011",
        name: "宝安区外环路广深高速新桥立交(市)",
        x: 113.844472,
        y: 22.741394,
      },
      {
        stcd: "812B2012",
        name: "宝安区固戍海滨新村文昌阁(市)",
        x: 113.838773,
        y: 22.590508,
      },
      {
        stcd: "812B2013",
        name: "宝安区宝安大道固戍地铁站(市)",
        x: 113.842853,
        y: 22.603799,
      },
      {
        stcd: "812B2014",
        name: "宝安区G107国道南行固戍大门(市)",
        x: 113.861564,
        y: 22.60301,
      },
      {
        stcd: "811B2016",
        name: "龙岗区宝荷路中新加油站对面(市)",
        x: 114.266901,
        y: 22.690982,
      },
      {
        stcd: "811B2017",
        name: "龙华区环观南路与观平路交汇处(市)",
        x: 114.087902,
        y: 22.702507,
      },
      {
        stcd: "811B2018",
        name: "龙华区龙华大道库坑天桥段(市)",
        x: 114.028412,
        y: 22.739908,
      },
      {
        stcd: "811B2020",
        name: "龙华区工业路壹成中心段(市)",
        x: 114.026149,
        y: 22.645892,
      },
      {
        stcd: "811B2021",
        name: "龙华区东环一路和平路交汇处(市)",
        x: 114.022405,
        y: 22.658228,
      },
      {
        stcd: "811B2022",
        name: "坪山区龙田社区大水湾(市)",
        x: 114.362504,
        y: 22.756419,
      },
      {
        stcd: "812B2015",
        name: "光明区东环大道松宝大道段(市)",
        x: 113.905975,
        y: 22.780487,
      },
      {
        stcd: "812B2016",
        name: "光明区正兆景嘉园(市)",
        x: 113.915488,
        y: 22.771728,
      },
      {
        stcd: "812B2017",
        name: "光明区圳美同富裕工业区(市)",
        x: 113.945501,
        y: 22.795314,
      },
      {
        stcd: "812B2018",
        name: "光明区根玉路东方大道交汇处(市)",
        x: 113.873906,
        y: 22.75835,
      },
      {
        stcd: "812B2019",
        name: "光明区上村社区龙大桥底(市)",
        x: 113.903089,
        y: 22.80278,
      },
      {
        stcd: "812B2021",
        name: "南山区怡海大道海关保税区(市)",
        x: 113.87392,
        y: 22.503375,
      },
      {
        stcd: "812B2022",
        name: "南山区南山大道南行亿利达村段(市)",
        x: 113.918802,
        y: 22.528453,
      },
      {
        stcd: "812B2023",
        name: "南山区沿山路前海康城华府段",
        x: 113.889393,
        y: 22.496699,
      },
      {
        stcd: "812B2007",
        name: "宝安区107国道新安段(107北行创业立交桥底、107南行裕安加油站)(市)",
        x: 113.891103,
        y: 22.568399,
      },
      {
        stcd: "811B2015",
        name: "龙岗区龙岗大道大芬地铁站段(市)",
        x: 114.130911,
        y: 22.614418,
      },
      {
        stcd: "811B2019",
        name: "龙华区福龙路与人民路高铁桥（福龙路简上段）(市)",
        x: 114.004602,
        y: 22.631504,
      },
      {
        stcd: "812B2020",
        name: "光明区马山头社区通兴路（上石家路与通兴路交汇处）(市)",
        x: 113.891526,
        y: 22.764012,
      },
      {
        stcd: "812B2024",
        name: "南山区深圳湾宾利（东滨路与中心路交叉口）(市)",
        x: 113.936042,
        y: 22.507615,
      },
      {
        stcd: "811B2001",
        name: "龙岗区平湖火车隧道口(市)",
        x: 114.118899,
        y: 22.694445,
      },
      {
        stcd: "811B2002",
        name: "龙岗区新木路广深铁路桥底(市)",
        x: 114.137095,
        y: 22.667882,
      },
      {
        stcd: "811B2003",
        name: "龙岗区新木路新围仔村路口(市)",
        x: 114.133868,
        y: 22.666902,
      },
      {
        stcd: "811B2004",
        name: "龙岗区布李路富民城段(市)",
        x: 114.112959,
        y: 22.619859,
      },
      {
        stcd: "811B2005",
        name: "龙岗区龙博路(市)",
        x: 114.11316,
        y: 22.623567,
      },
      {
        stcd: "811B2006",
        name: "龙岗区五和大道四季花城(市)",
        x: 114.055778,
        y: 22.627335,
      },
      {
        stcd: "811B2007",
        name: "龙岗区沙西小学至南岭万家乐段(市)",
        x: 114.145539,
        y: 22.613778,
      },
      {
        stcd: "811B2008",
        name: "宝安区金湾大道中锦钢材交易中心段(市)",
        x: 113.85195,
        y: 22.558795,
      },
      {
        stcd: "811B2009",
        name: "南山区科苑北路与高新中四道交汇处(市)",
        x: 113.940167,
        y: 22.546086,
      },
      {
        stcd: "811B2010",
        name: "龙岗区安良六村安居路（安良六村安业路与安居路交汇处）(市)",
        x: 114.210061,
        y: 22.632546,
      },
      {
        stcd: "811B2011",
        name: "龙岗区松元头(市)",
        x: 114.114579,
        y: 22.627083,
      },
      {
        stcd: "811B2012",
        name: "龙岗区湖南立交(市)",
        x: 114.116499,
        y: 22.603918,
      },
      {
        stcd: "811B2013",
        name: "龙岗区高背路惠盐高速桥洞积水点(市)",
        x: 114.270831,
        y: 22.709118,
      },
      {
        stcd: "811B2014",
        name: "龙岗区鹤坑桥洞(市)",
        x: 114.325973,
        y: 22.788351,
      },
      {
        stcd: "811B2023",
        name: "龙华区泗黎路华盛峰荟名庭万科启城段",
        x: 114.034903,
        y: 22.711639,
      },
      {
        stcd: "811B2024",
        name: "龙华区民治大道万众城段(市)",
        x: 114.032111,
        y: 22.633236,
      },
      {
        stcd: "811B2025",
        name: "龙华区布龙路与龙华大道交汇处(市)",
        x: 114.023132,
        y: 22.636349,
      },
      {
        stcd: "811B2026",
        name: "龙岗区龙城大道与龙平东路交汇处(市)",
        x: 114.247259,
        y: 22.734736,
      },
      {
        stcd: "811B2027",
        name: "龙岗区龙西中路与盐龙大道交汇处(市)",
        x: 114.247721,
        y: 22.742435,
      },
      {
        stcd: "811B2028",
        name: "龙华区望成路佳兆业通达汇轩段",
        x: 114.024547,
        y: 22.67544,
      },
      {
        stcd: "811B2029",
        name: "宝安区107国道新安段北行与创业立交交汇处(市)",
        x: 113.89157,
        y: 22.568591,
      },
      {
        stcd: "811B2030",
        name: "龙岗区长深高速四方埔社区(市)",
        x: 114.319586,
        y: 22.760679,
      },
      {
        stcd: "811B2039",
        name: "龙岗区龙岗区政府(市)",
        x: 114.242882,
        y: 22.722422,
      },
      {
        stcd: "811B2040",
        name: "龙岗区五和地铁站H出入口(市)",
        x: 114.055764,
        y: 22.628134,
      },
      {
        stcd: "811B2041",
        name: "龙岗区长龙地铁站C2出入口(市)",
        x: 114.109399,
        y: 22.610383,
      },
      {
        stcd: "811B2042",
        name: "南山区科苑北路与高新中二道交汇处(市)",
        x: 113.940432,
        y: 22.54998,
      },
      {
        stcd: "811B2043",
        name: "龙岗区深圳远东妇产医院(市)",
        x: 114.065749,
        y: 22.64217,
      },
      {
        stcd: "811B2048",
        name: "龙岗区吉榕路桥洞(市)",
        x: 114.162586,
        y: 22.637966,
      },
      {
        stcd: "811B2049",
        name: "福田区香蜜湖路公交总站(市)",
        x: 114.023057,
        y: 22.542356,
      },
      {
        stcd: "811B2050",
        name: "龙岗区布澜路国芬路口(市)",
        x: 114.129024,
        y: 22.632523,
      },
      {
        stcd: "811B2045",
        name: "龙岗区布吉站（深圳东站）(市)",
        x: 114.116886,
        y: 22.604504,
      },
      {
        stcd: "812B2029",
        name: "罗湖区红岗公园(市)",
        x: 114.106963,
        y: 22.57514,
      },
      {
        stcd: "812B2030",
        name: "罗湖区沿河南路文锦路社区(市)",
        x: 114.123358,
        y: 22.54083,
      },
      {
        stcd: "812B2031",
        name: "罗湖区深南东路黄贝岭(市)",
        x: 114.133816,
        y: 22.54948,
      },
      {
        stcd: "812B2032",
        name: "福田区滨河上步立交桥(市)",
        x: 114.08948,
        y: 22.538144,
      },
      {
        stcd: "812B2056",
        name: "罗湖区罗湖火车站(市)",
        x: 114.112436,
        y: 22.536714,
      },
      {
        stcd: "812B2057",
        name: "罗湖区罗湖区委(市)",
        x: 114.125961,
        y: 22.551968,
      },
      {
        stcd: "812B2058",
        name: "罗湖区万象城(市)",
        x: 114.105899,
        y: 22.543356,
      },
      {
        stcd: "812B2059",
        name: "罗湖区洪湖地铁站D出入口(市)",
        x: 114.118048,
        y: 22.56923,
      },
      {
        stcd: "812B2087",
        name: "罗湖区东湖路（太白路口结合部）(市)",
        x: 114.137424,
        y: 22.580611,
      },
      {
        stcd: "812B2088",
        name: "罗湖区桂园片区（大剧院段）(市)",
        x: 114.101791,
        y: 22.543711,
      },
      {
        stcd: "812B2089",
        name: "罗湖区晒布路与东门中路交汇处(市)",
        x: 114.117192,
        y: 22.551054,
      },
      {
        stcd: "812B2090",
        name: "罗湖区东湖公园爱国路太宁路路口(市)",
        x: 114.138152,
        y: 22.569631,
      },
      {
        stcd: "812B2060",
        name: "罗湖区文锦渡口岸(市)",
        x: 114.126509,
        y: 22.542289,
      },
      {
        stcd: "811B2031",
        name: "龙华区泗黎路凹背社区、富坑社区(市)",
        x: 114.03131,
        y: 22.737187,
      },
      {
        stcd: "811B2032",
        name: "龙华区银星科技园(市)",
        x: 114.042966,
        y: 22.733286,
      },
      {
        stcd: "811B2033",
        name: "龙华区观光路与福前路交汇处(市)",
        x: 114.021554,
        y: 22.731132,
      },
      {
        stcd: "811B2034",
        name: "龙华区三联社区(市)",
        x: 114.023808,
        y: 22.660138,
      },
      {
        stcd: "811B2035",
        name: "龙岗区布龙路与五和大道交汇处(市)",
        x: 114.055459,
        y: 22.630913,
      },
      {
        stcd: "811B2036",
        name: "龙华区新区大道深圳北站(市)",
        x: 114.026951,
        y: 22.611383,
      },
      {
        stcd: "811B2046",
        name: "龙华区龙华壹方城(市)",
        x: 114.026905,
        y: 22.645403,
      },
      {
        stcd: "811B2051",
        name: "龙华区昌茂二路(市)",
        x: 114.036405,
        y: 22.742331,
      },
      {
        stcd: "811B2052",
        name: "龙华区大浪新围街大船坑市场段(市)",
        x: 113.996892,
        y: 22.692161,
      },
      {
        stcd: "811B2053",
        name: "龙岗区盛龙路转龙城大道(市)",
        x: 114.252247,
        y: 22.730425,
      },
      {
        stcd: "811B2037",
        name: "龙岗区长山路积水点(市)",
        x: 114.326261,
        y: 22.805927,
      },
      {
        stcd: "811B2038",
        name: "龙岗区龙东社区金井路一号",
        x: 114.283807,
        y: 22.724343,
      },
      {
        stcd: "811B207",
        name: "龙岗区龙岗大道汇源公交站积水点(市)",
        x: 114.32587,
        y: 22.795075,
      },
      {
        stcd: "812B2083",
        name: "福田区香梅莲花路口(市)",
        x: 114.033101,
        y: 22.553543,
      },
      {
        stcd: "812B2084",
        name: "福田区信托花园(市)",
        x: 114.047454,
        y: 22.531775,
      },
      {
        stcd: "812B2085",
        name: "福田区上步红荔路口(市)",
        x: 114.091221,
        y: 22.552005,
      },
      {
        stcd: "812B2086",
        name: "宝安区宝龙市场（宝农北巷与宝农西巷交汇处）(市)",
        x: 113.901506,
        y: 22.561096,
      },
      {
        stcd: "812B2025",
        name: "福田区皇岗立交桥与皇岗路交汇处(市)",
        x: 114.066469,
        y: 22.543247,
      },
      {
        stcd: "812B2026",
        name: "福田区北环大道与梅林路交汇处(市)",
        x: 114.033029,
        y: 22.562786,
      },
      {
        stcd: "812B2027",
        name: "福田区侨香路香梅社区(市)",
        x: 114.025249,
        y: 22.555854,
      },
      {
        stcd: "812B2028",
        name: "福田区侨香路香安社区(市)",
        x: 114.00384,
        y: 22.553111,
      },
      {
        stcd: "812B2052",
        name: "福田区市民中心（福中三路）(市)",
        x: 114.0537,
        y: 22.545577,
      },
      {
        stcd: "812B2053",
        name: "福田区民田路深圳证券交易所(市)",
        x: 114.04771,
        y: 22.543664,
      },
      {
        stcd: "812B2054",
        name: "福田区燃气集团股份有限公司(市)",
        x: 114.051061,
        y: 22.578384,
      },
      {
        stcd: "812B2055",
        name: "福田区深南大道车公庙交通枢纽段(市)",
        x: 114.015901,
        y: 22.538546,
      },
      {
        stcd: "812B2074",
        name: "宝安区辛养旧村辛居路(市)",
        x: 113.802825,
        y: 22.741204,
      },
      {
        stcd: "812B2075",
        name: "宝安区山门第三工业区(市)",
        x: 113.85321,
        y: 22.784968,
      },
      {
        stcd: "812B2076",
        name: "坪山区深汕路",
        x: 114.395895,
        y: 22.758359,
      },
      {
        stcd: "812B2077",
        name: "宝安区洪浪北地铁站(市)",
        x: 113.905512,
        y: 22.577477,
      },
      {
        stcd: "812B2078",
        name: "宝安区东风幼儿园(市)",
        x: 113.843308,
        y: 22.775238,
      },
      {
        stcd: "812B2079",
        name: "宝安区海乐41区(市)",
        x: 113.89556,
        y: 22.560678,
      },
      {
        stcd: "812B2080",
        name: "宝安区前进二路(市)",
        x: 113.88278,
        y: 22.588506,
      },
      {
        stcd: "812B2081",
        name: "宝安区园岭商场（园岭桃源居）(市)",
        x: 113.934346,
        y: 22.692934,
      },
      {
        stcd: "812B2082",
        name: "宝安区北环路与爱群路路口(市)",
        x: 113.924622,
        y: 22.693491,
      },
      {
        stcd: "812B2042",
        name: "宝安区宝安区幸福路与恒珠一路(市)",
        x: 113.837593,
        y: 22.806366,
      },
      {
        stcd: "812B2043",
        name: "宝安区福围市场",
        x: 113.819043,
        y: 22.654121,
      },
      {
        stcd: "812B2044",
        name: "宝安区宝安区福和路西六巷(市)",
        x: 113.79457,
        y: 22.759819,
      },
      {
        stcd: "812B2045",
        name: "宝安区宝田一路海峦坊",
        x: 113.874917,
        y: 22.598466,
      },
      {
        stcd: "812B2046",
        name: "宝安区金沙二路与民福路交叉口(市)",
        x: 113.799142,
        y: 22.726058,
      },
      {
        stcd: "812B2047",
        name: "宝安区宝安区沙井西环路正科时代(市)",
        x: 113.794251,
        y: 22.714094,
      },
      {
        stcd: "812B2048",
        name: "宝安区和一社区团结街",
        x: 113.781591,
        y: 22.71419,
      },
      {
        stcd: "812B2067",
        name: "宝安区海雅缤纷城建安一路99号(市)",
        x: 113.899839,
        y: 22.562029,
      },
      {
        stcd: "812B2068",
        name: "宝安区万达广场（深圳宝安店)(市)",
        x: 113.888395,
        y: 22.571819,
      },
      {
        stcd: "812B2069",
        name: "宝安区固戍地铁站A/F出入口(市)",
        x: 113.842463,
        y: 22.603641,
      },
      {
        stcd: "812B2070",
        name: "宝安区107国道新安段与兴华一路交汇处(市)",
        x: 113.895714,
        y: 22.563427,
      },
      {
        stcd: "812B2072",
        name: "光明区东长路外环高速长圳入口(市)",
        x: 113.922923,
        y: 22.724371,
      },
      {
        stcd: "812B2073",
        name: "南山区珠光路塘朗雅苑段",
        x: 113.953562,
        y: 22.575215,
      },
      {
        stcd: "812B2049",
        name: "南山区桑泰丹华园一期",
        x: 113.95932,
        y: 22.593478,
      },
      {
        stcd: "812B2050",
        name: "南山区同乐路壮大工业区段",
        x: 113.927386,
        y: 22.591541,
      },
      {
        stcd: "812B2051",
        name: "光明区绘猫路与楼村一巷交汇处(市)",
        x: 113.919317,
        y: 22.782332,
      },
      {
        stcd: "812B2071",
        name: "宝安区宝安大道辅路康达尔山海上园（京基智农山海上园）",
        x: 113.850587,
        y: 22.595367,
      },
      {
        stcd: "812B2033",
        name: "南山区月亮湾大道前湾三路交叉口(市)",
        x: 113.894734,
        y: 22.513094,
      },
      {
        stcd: "812B2034",
        name: "福田区春风隧道西侧入口(市)",
        x: 114.092278,
        y: 22.538099,
      },
      {
        stcd: "812B2035",
        name: "南山区南山大道与登良路交叉口(市)",
        x: 113.913964,
        y: 22.518247,
      },
      {
        stcd: "812B2036",
        name: "南山区南新路北头豪苑(市)",
        x: 113.914359,
        y: 22.524431,
      },
      {
        stcd: "812B2037",
        name: "南山区滨海大道与南山大道交叉口(市)",
        x: 113.919054,
        y: 22.528456,
      },
      {
        stcd: "812B2038",
        name: "南山区桃园路与南新路交叉口(市)",
        x: 113.91383,
        y: 22.535646,
      },
      {
        stcd: "812B2039",
        name: "南山区后海大道与登良路交叉口(市)",
        x: 113.927331,
        y: 22.51277,
      },
      {
        stcd: "812B2040",
        name: "南山区后海大道港湾创业大厦(市)",
        x: 113.929255,
        y: 22.495824,
      },
      {
        stcd: "812B2041",
        name: "南山区深南大道高新园地铁AD口(市)",
        x: 113.949076,
        y: 22.543831,
      },
      {
        stcd: "812B2061",
        name: "南山区深圳湾口岸(市)",
        x: 113.942249,
        y: 22.506547,
      },
      {
        stcd: "812B2062",
        name: "南山区前湾公园地铁站A出入口(市)",
        x: 113.8844,
        y: 22.518379,
      },
      {
        stcd: "812B2063",
        name: "宝安区碧海湾地铁站B出入口(市)",
        x: 113.852089,
        y: 22.57712,
      },
      {
        stcd: "812B2064",
        name: "南山区粤海门地铁站D2出入口(市)",
        x: 113.939884,
        y: 22.535867,
      },
      {
        stcd: "812B2065",
        name: "南山区桂庙路地下道路(市)",
        x: 113.909006,
        y: 22.5257,
      },
      {
        stcd: "812B2066",
        name: "南山区国家超级计算深圳中心(市)",
        x: 113.987325,
        y: 22.598805,
      },
      {
        stcd: "816B2002",
        name: "龙岗区龙岗大道雄丰工业区段",
        x: 114.276227,
        y: 22.748047,
      },
      {
        stcd: "816B2003",
        name: "盐田区沙头角口岸小区(市)",
        x: 114.224113,
        y: 22.551971,
      },
      {
        stcd: "816B2004",
        name: "龙华区桃苑新村",
        x: 114.005432,
        y: 22.660044,
      },
      {
        stcd: "816B2005",
        name: "宝安区新圳西路万佳商场段（海雅缤纷城段）(市)",
        x: 113.899879,
        y: 22.563515,
      },
      {
        stcd: "816B2001",
        name: "南山区科苑大道（北环-深南）(市)",
        x: 113.937333,
        y: 22.546095,
      },
      {
        stcd: "811B2044",
        name: "龙岗区英才学校(市)",
        x: 114.213047,
        y: 22.721772,
      },
    ];
    uniqueData.push(...tempData);
    uniqueData.forEach((item) => {
      const entity = viewer.entities.add({
        id: `waterLogging_${item.stcd}`,
        name: item.name,
        position: Cesium.Cartesian3.fromDegrees(
          parseFloat(item.x),
          parseFloat(item.y),
          heightValue
        ),
        type: "waterLoggingPoint",
        properties: item,
        point: {
          pixelSize: 3,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          clampToGround: true, //贴地
        },
        billboard: {
          // 添加图标
          image: require("@/assets/map/lowRisk.png"), // 替换为你的图标路径
          width: 35,
          height: 40,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: item.name,
          font: "10pt sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, -80),
          showBackground: true,
          backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.7),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            4000
          ),
        },
      });
      this.waterLoggingPointEntity.push(entity);
    });
    //对图层监听事件
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //点击事件
    handler.setInputAction(function (e) {
      var pick = viewer.scene.pick(e.position);
      if (pick && pick.id) {
        var entityData = pick.id;
        if (entityData.type === "waterLoggingPoint") {
          //点击图标emit id
          var waterLoggingProperties = entityData.properties.getValue(
            Cesium.JulianDate.now()
          );
          if(waterLoggingProperties.id){
             eventBus.emit("openJLDDetail", entityData.id);
          }
         
          // viewer.camera.flyTo({
          //   destination: Cesium.Cartesian3.fromDegrees(
          //     waterLoggingProperties.x,
          //     waterLoggingProperties.y,
          //     1000
          //   ),
          //   duration: 3,
          // });
          viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
              waterLoggingProperties.x,
              waterLoggingProperties.y,
              1000
            ),
            // orientation: {
            //   heading: 0.3240206040434135,
            //   pitch: -0.29413705052087513,
            //   roll: 6.283173615755098,
            // },
            duration: 3,
            complete: function callback() {
              // 定位完成之后的回调函数
            },
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.hasLoaded = true;
  }
  setLegend() {
    eventBus.emit("setLegend", {
      type: "pointLayer",
      data: this.legend,
    });
  }
  delLegend() {
    eventBus.emit("closeLegend", {
      type: "pointLayer",
      data: this.legend,
    });
  }
  hide() {
    // const { viewer, id } = this;
    // if (this.waterLoggingPointEntity&&this.waterLoggingPointEntities.length > 0) {
    //   viewer.entities.remove(this.waterLoggingPointEntity);
    //   this.waterLoggingPointEntity = null;
    // }
    this.delLegend();
    if (
      this.waterLoggingPointEntity &&
      this.waterLoggingPointEntity.length > 0
    ) {
      this.waterLoggingPointEntity.forEach((entity) => {
        entity.show = false;
      });
    }
  }
}
export default new waterLoggingPoint();
