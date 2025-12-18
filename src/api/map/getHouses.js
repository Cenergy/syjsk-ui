
// 写一个缓存数据的接口
// 地址  const baseURL= `/geodata/geojson/houses.geojson`
import {lodash} from 'swpdmap'
import { constant } from '@/map'
console.log("🚀 ~ lodash:", lodash);
class HourseData{
  constructor(baseURL = "/geodata/geojson/houses.geojson"){
    this.data = null;
    this.baseURL = baseURL;
    this.hasFetched = false;
    this.groupedData = {};
    this.pending = null; // 当前进行中的请求 Promise，用于去重
    this.abortController = null; // 当前请求的中止控制器
  }
  getData(){
    return this.data;
  }
  setData(data){
    this.data = data;
  }
  async getHouses(force = false){
    const cached = this.getData();
    // 已有缓存且不强制刷新，直接返回
    if (!force && cached && this.hasFetched) return cached;

    // 如果已有进行中的请求，直接复用该 Promise，避免重复请求
    if (!force && this.pending) return this.pending;

    // 若 force，则取消之前的进行中请求
    if (force && this.abortController) {
      try { this.abortController.abort(); } catch (e) {}
      this.pending = null;
      this.abortController = null;
    }

    try {
      this.abortController = new AbortController();
      const { signal } = this.abortController;

      this.pending = (async () => {
        const response = await fetch(this.baseURL, {
          method: "GET",
          signal,
        });
        const data = await response.json();
        this.setData(data);
        this.groupHouses(data);
        this.hasFetched = true;
        return data;
      })();

      const result = await this.pending;
      return result;
    } catch (error) {
      if (error && error.name === "AbortError") {
        return { code: 499, message: "Request aborted" };
      }
      return { code: 500, message: error };
    } finally {
      this.pending = null;
      this.abortController = null;
    }
  }
  // 统计房屋各种组group
  groupHouses(data){ 
    if (!data || !data.features) return {};
    const features = data.features.map(item => item.properties || {});
    const validFeatures = features.filter((f) => Number.isFinite(Number(f.hsx)));
    const byTown = lodash.groupBy(features, "xz");

    const normalizeHsx = (hsx) => {
      // 统一为字符串键，数值按一位小数归一
      const n = Number(hsx);
      if (Number.isFinite(n)) return n.toFixed(1);
      return null; // 非数字不参与统计
    };

    // 确定“水位档位”基准序列（升序），用于累计统计
    const {
      EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT = [],
    } = constant || {};
    let canonicalKeys = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT
      .map((c) => {
        const n = Number(c.value);
        return Number.isFinite(n) ? n.toFixed(1) : null;
      })
      .filter((k) => k != null);
    if (!canonicalKeys.length) {
      // 回退：从数据中提取存在的 hsx 档位
      canonicalKeys = Array.from(
        new Set(validFeatures.map((f) => normalizeHsx(f.hsx)).filter(Boolean))
      );
    }
    canonicalKeys = canonicalKeys
      .map((k) => Number(k))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b)
      .map((n) => n.toFixed(1));

    const buildCumulative = (baseCounts) => {
      // baseCounts: { '199.5': n, '200.0': m, ... }
      const result = {};
      let running = 0;
      canonicalKeys.forEach((key) => {
        running += Number(baseCounts[key] || 0);
        result[key] = running;
      });
      return result;
    };

    const townHsxCounts = {};
    const townVillageHsxCounts = {};

    Object.entries(byTown).forEach(([xz, arr]) => {
      // 乡镇下按 hsx 统计
      const byHsx = lodash.groupBy(arr, (f) => normalizeHsx(f.hsx));
      const baseCounts = Object.fromEntries(
        canonicalKeys.map((k) => [k, (byHsx[k] || []).length])
      );
      townHsxCounts[xz] = buildCumulative(baseCounts);
      // 乡镇总数（该乡镇所有要素数量）
      townHsxCounts[xz]["__总计__"] = arr.filter((f) => normalizeHsx(f.hsx) != null).length;

      // 乡镇下各村（ssc）再按 hsx 统计
      const byVillage = lodash.groupBy(arr, (f) => f.ssc || "__未标注村__");
      const villageStats = {};
      Object.entries(byVillage).forEach(([ssc, vArr]) => {
        const vByHsx = lodash.groupBy(vArr, (f) => normalizeHsx(f.hsx));
        const vBaseCounts = Object.fromEntries(
          canonicalKeys.map((k) => [k, (vByHsx[k] || []).length])
        );
        const cumulative = buildCumulative(vBaseCounts);
        cumulative["__总计__"] = vArr.filter((f) => normalizeHsx(f.hsx) != null).length;
        villageStats[ssc] = cumulative;
      });
      // 该乡镇下所有村的总计（按 hsx 聚合 + 总数）
      const villageTotalBase = Object.fromEntries(
        canonicalKeys.map((k) => [k, (byHsx[k] || []).length])
      );
      const villageTotalCum = buildCumulative(villageTotalBase);
      villageTotalCum["__总计__"] = arr.filter((f) => normalizeHsx(f.hsx) != null).length;
      villageStats["__总计__"] = villageTotalCum;
      townVillageHsxCounts[xz] = villageStats;
    });

    // 全域总体统计：所有乡镇合并后的 hsx 分布 + 总数
    const overallByHsx = lodash.groupBy(validFeatures, (f) => normalizeHsx(f.hsx));
    const overallBaseCounts = Object.fromEntries(
      canonicalKeys.map((k) => [k, (overallByHsx[k] || []).length])
    );
    const overallCum = buildCumulative(overallBaseCounts);
    const overallTotal = validFeatures.length;
    townHsxCounts["__总计__"] = { ...overallCum, __总计__: overallTotal };
    townVillageHsxCounts["__总计__"] = { ...overallCum, __总计__: overallTotal };

    this.groupedData = { townHsxCounts, townVillageHsxCounts };
    return this.groupedData;
  }
  // 获取按乡镇的 hsx 统计
  getTownHsxCounts(){
    return (this.groupedData && this.groupedData.townHsxCounts) || {};
  }
  // 获取按乡镇-村的 hsx 统计
  getTownVillageHsxCounts(){
    return (this.groupedData && this.groupedData.townVillageHsxCounts) || {};
  }
  filterHouses(filterOptions = {}){ 
    const data = this.getData();
    if (!data) return [];
    const {features=[]} = data;
    return  features.filter((feature) => {
      const { properties } = feature;
      return Object.entries(filterOptions).every(([key, value]) => {
        return properties[key] === value;
      });
    });
  }
  // 帮我写两个函数，比如我想获取198.4受影响的房屋，XX乡镇XX栋XX乡镇XX栋XX乡镇XX栋
  // 还有一个是198.4受影响的房屋，XX村XX栋XX村XXXX栋
  /**
   * 获取指定水位（含及以下累计）在各乡镇的受影响房屋数摘要。
   * 示例输出："198.4受影响的房屋，A镇12栋，B镇8栋，C镇0栋"
   * - 计数规则为累计：如 200.0 包含 199.5；200.6 包含 200.0 和 199.5。
   * @param {number|string} level 水位值，例如 198.4、200、200.6
   * @returns {Promise<string>} 描述字符串
   */
   getAffectedSummaryByTown(level){
    const lvl = Number(level);
    if (!Number.isFinite(lvl)) return "水位值无效";
    const townCounts = this.getTownHsxCounts();
    if (!townCounts) return "暂无数据";
    const allInfo=townCounts["__总计__"]||{};
    const allCount=allInfo[String(level)]||0;

    const towns = Object.keys(townCounts).filter((k) => k !== "__总计__");
    const pickCumulative = (obj, value) => {
      const keys = Object.keys(obj)
        .filter((k) => k !== "__总计__")
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n) && n <= value)
        .sort((a, b) => a - b);
      if (!keys.length) return 0;
      const maxKey = keys[keys.length - 1].toFixed(1);
      return Number(obj[maxKey] || 0);
    };
    const parts = towns.map((xz) => {
      const count = pickCumulative(townCounts[xz] || {}, lvl);
      return `${xz}${count}栋`;
    });
    if (allCount <= 0) return '没有受影响的房屋';
    return `受影响的房屋共计${allCount}栋(${parts.join('，')})`;
  }

  /**
   * 获取指定水位（含及以下累计）在各村（按乡镇分组）的受影响房屋数摘要。
   * 示例输出："198.4受影响的房屋，A镇-甲村5栋，A镇-乙村3栋，B镇-丙村0栋"
   * - 计数规则为累计：如 200.0 包含 199.5；200.6 包含 200.0 和 199.5。
   * @param {number|string} level 水位值，例如 198.4、200、200.6
   * @returns {Promise<string>} 描述字符串
   */
   getAffectedSummaryByVillage(level, town){
    const lvl = Number(level);
    if (!Number.isFinite(lvl)) return "水位值无效";
 
    const townVillage = this.getTownVillageHsxCounts();
    if (!townVillage) return "暂无数据";
    const allAreaInfo=townVillage[town]||{};
    const allInfo=allAreaInfo["__总计__"]||{};
    const allCount=allInfo[String(level)]||0;
    const pickCumulative = (obj, value) => {
      const keys = Object.keys(obj)
        .filter((k) => k !== "__总计__")
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n) && n <= value)
        .sort((a, b) => a - b);
      if (!keys.length) return 0;
      const maxKey = keys[keys.length - 1].toFixed(1);
      return Number(obj[maxKey] || 0);
    };
    const parts = [];
    let total = 0;
    Object.entries(townVillage).forEach(([xz, villages]) => {
      if (xz === "__总计__") {
        return ;
      }
      if (town && xz !== town) return;
      Object.entries(villages).forEach(([ssc, counts]) => {
        if (ssc === "__总计__") return;
        const count = pickCumulative(counts || {}, lvl);
        let tempSsc = ssc;
        if (ssc==="__未标注村__") {
          tempSsc = xz;
        }
        if (count > 0) {
          parts.push(`${tempSsc}${count}栋`);
        }
      });
    });
    if (allCount <= 0) return '没有受影响的房屋';
    return `受影响的房屋共计${allCount}栋(${parts.join('，')})`;
  }
  clear(){
    this.setData(null);
    this.hasFetched = false;
  }
}
const houseData = new HourseData();

export default houseData;
export { houseData };