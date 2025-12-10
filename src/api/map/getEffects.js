
// 写一个缓存数据的接口
// 地址  const baseURL= `/geodata/geojson/houses.geojson`
class EffectsData{
  constructor(baseURL = `/geodata/effects/`){
    this.data = null;
    this.baseURL = baseURL;
    this.hasFetched = false;
  }
  getData(){
    return this.data;
  }
  setData(data){
    this.data = data;
  }
  async getHouses(force = false){
    const cached = this.getData();
    if (!force && cached && this.hasFetched) return cached;
    try {
      const response = await fetch(this.baseURL, {
        method: "GET",
      });
      const data = await response.json();
      this.setData(data);
      this.hasFetched = true;
      return data;
    } catch (error) {
      return { code: 500, message: error };
    }
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
  clear(){
    this.setData(null);
    this.hasFetched = false;
  }
}
const houseData = new EffectsData();

export default houseData;
export { houseData };