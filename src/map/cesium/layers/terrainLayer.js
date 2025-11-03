import BaseLayer from "./baseLayer";

class TerrainLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.terrainProvider = null;
    this.originalTerrainProvider = null;
    this.isLoaded = false;
  }

  async show() {
    const { viewer } = this;
    
    if (!viewer) {
      console.warn('Viewer not available for terrain layer');
      return;
    }

    // 保存原始地形提供者
    if (!this.originalTerrainProvider) {
      this.originalTerrainProvider = viewer.scene.terrainProvider;
    }

    // 如果已经加载过，则直接应用
    if (this.isLoaded && this.terrainProvider) {
      viewer.scene.terrainProvider = this.terrainProvider;
      return;
    }

    try {
      // 尝试加载地形数据
      await this.loadTerrain(viewer, '/geodata/terrain1');
      this.isLoaded = true;
    } catch (error) {
      console.warn('Failed to load terrain, using ellipsoid terrain:', error);
      // 回退到椭球体地形
      this.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
      viewer.scene.terrainProvider = this.terrainProvider;
    }
  }

  hide() {
    const { viewer } = this;
    
    if (!viewer) {
      return;
    }

    // 恢复到原始地形提供者或椭球体地形
    const fallbackTerrain = this.originalTerrainProvider || new Cesium.EllipsoidTerrainProvider({});
    viewer.scene.terrainProvider = fallbackTerrain;
  }

  // 异步加载地形数据
  async loadTerrain(viewer, url) {
    try {
      this.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(url, {
        requestWaterMask: false,
        requestVertexNormals: true,
      });
      
      // 应用地形提供者
      viewer.scene.terrainProvider = this.terrainProvider;
      
      console.log('Terrain loaded successfully from:', url);
      return this.terrainProvider;
    } catch (error) {
      console.error('Error loading terrain from:', url, error);
      throw error;
    }
  }

  // 重新加载地形
  async reload(url = '/geodata/terrain') {
    this.isLoaded = false;
    this.terrainProvider = null;
    await this.show();
  }
  
  // 设置地形夸张系数
  setVerticalExaggeration(exaggeration = 1.0) {
    const { viewer } = this;
    if (viewer && viewer.scene) {
      viewer.scene.verticalExaggeration = exaggeration;
    }
  }
  
  // 切换地形光照
  toggleLighting(enabled = true) {
    const { viewer } = this;
    if (viewer && viewer.scene && viewer.scene.globe) {
      viewer.scene.globe.enableLighting = enabled;
    }
  }
}

export default new TerrainLayer();