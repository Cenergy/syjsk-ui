/**
 * TilesetModelAccuracy 重构后功能测试
 * 用于验证重构后的代码功能完整性
 */

// 模拟测试环境
const mockViewer = {
  scene: {
    primitives: {
      add: jest.fn(),
      remove: jest.fn()
    },
    camera: {
      changed: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      },
      positionCartographic: {
        height: 1000
      }
    }
  }
};

const mockCesium = {
  Resource: jest.fn().mockImplementation((options) => options),
  Cesium3DTileset: {
    fromUrl: jest.fn().mockResolvedValue({
      show: true,
      isDestroyed: () => false,
      destroy: jest.fn()
    })
  },
  Cartographic: {
    fromCartesian: jest.fn()
  }
};

// 模拟依赖
jest.mock('@/map', () => ({
  constant: {
    MODEL_3DTILES_INFO_LIST: [
      { name: 'model1', center: [120, 30, 0] },
      { name: 'model2', center: [121, 31, 0] }
    ]
  }
}));

jest.mock('@/map/cesium/helps/modelHandle', () => ({
  moveModel: jest.fn().mockReturnValue({})
}));

// 设置全局 Cesium
global.Cesium = mockCesium;

import { TilesetModelAccuracy } from './tilesetModelAccuracy_old.js';

describe('TilesetModelAccuracy 重构测试', () => {
  let instance;

  beforeEach(() => {
    instance = new TilesetModelAccuracy();
    instance.viewer = mockViewer;
    jest.clearAllMocks();
  });

  test('应该正确初始化默认配置', () => {
    expect(instance.tilesetConfig).toBeDefined();
    expect(instance.visibilityConfig).toBeDefined();
    expect(instance.tilesetModels).toEqual([]);
    expect(instance.tilesetFlags).toEqual([]);
  });

  test('应该能够创建Tileset资源', () => {
    const modelInfo = { name: 'test-model' };
    const timestamp = '123456789';
    
    const resource = instance.createTilesetResource(modelInfo, timestamp);
    
    expect(resource.url).toBe('/geodata/3dtiles/test-model/tileset.json?timestamp=123456789');
  });

  test('应该能够获取状态信息', () => {
    instance.hasLoaded = true;
    instance.tilesetModels = [1, 2];
    instance.tilesetFlags = [1];
    
    const status = instance.getStatus();
    
    expect(status.hasLoaded).toBe(true);
    expect(status.totalModels).toBe(2);
    expect(status.loadedModels).toBe(1);
    expect(status.isAllLoaded).toBe(false);
  });

  test('应该能够设置模型可见性', () => {
    const mockTileset = { show: true, isDestroyed: () => false };
    instance.tilesetFlags = [mockTileset];
    
    const result = instance.setModelVisibility('model1', false);
    
    expect(result).toBe(true);
    expect(mockTileset.show).toBe(false);
  });

  test('应该能够获取模型可见性', () => {
    const mockTileset = { show: true, isDestroyed: () => false };
    instance.tilesetFlags = [mockTileset];
    
    const visibility = instance.getModelVisibility('model1');
    
    expect(visibility).toBe(true);
  });

  test('应该能够正确处理不存在的模型', () => {
    const result = instance.setModelVisibility('non-existent', true);
    const visibility = instance.getModelVisibility('non-existent');
    
    expect(result).toBe(false);
    expect(visibility).toBe(null);
  });

  test('应该能够更新可见性配置', () => {
    const newConfig = { minCameraHeight: 100, maxCameraHeight: 5000 };
    
    instance.updateVisibilityConfig(newConfig);
    
    expect(instance.visibilityConfig.minCameraHeight).toBe(100);
    expect(instance.visibilityConfig.maxCameraHeight).toBe(5000);
  });

  test('应该能够启用/禁用可见性控制', () => {
    instance.setVisibilityControlEnabled(false);
    expect(instance.visibilityControlEnabled).toBe(false);
    
    instance.setVisibilityControlEnabled(true);
    expect(instance.visibilityControlEnabled).toBe(true);
  });
});

console.log('✅ TilesetModelAccuracy 重构测试文件已创建');
console.log('📋 测试覆盖的功能：');
console.log('  - 默认配置初始化');
console.log('  - 资源创建');
console.log('  - 状态获取');
console.log('  - 模型可见性控制');
console.log('  - 配置更新');
console.log('  - 错误处理');