const Common = `
        uniform sampler2D heightMap;
        uniform float heightScale;
        uniform float maxElevation;
        uniform float minElevation;
        uniform sampler2D iChannel0;
        uniform float iTime;

        uniform float coast2water_fadedepth;
        uniform float large_waveheight; // change to adjust the "heavy" waves
        uniform float large_wavesize;  // factor to adjust the large wave size
        uniform float small_waveheight;  // change to adjust the small random waves
        uniform float small_wavesize;   // factor to ajust the small wave size
        uniform float water_softlight_fact;  // range [1..200] (should be << smaller than glossy-fact)
        uniform float water_glossylight_fact; // range [1..200]
        uniform float particle_amount;
        uniform float WATER_LEVEL; // Water level (range: 0.0 - 2.0)
        uniform float transparency; // 添加透明度uniform
        vec3 watercolor = vec3(0.0, 0.60, 0.66); // 'transparent' low-water color (RGB)
        vec3 watercolor2 = vec3(0.0,0.0,0.5); // deep-water color (RGB, should be darker than the low-water color)
        vec3 water_specularcolor = vec3(1.3, 1.3, 0.9);    // specular Color (RGB) of the water-highlights
        vec3 light;

        // calculate random value
        float hash(float n) {
            return fract(sin(n) * 43758.5453123);
        }

        // 2d noise function
        float noise1(in vec2 x) {
            vec2 p = floor(x);
            vec2 f = smoothstep(0.0, 1.0, fract(x));
            float n = p.x + p.y * 57.0;
            return mix(mix(hash(n + 0.0), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
        }

        float noise(vec2 p) {
            return textureLod(iChannel0, p * vec2(1. / 256.), 0.0).x;
        }

        float height_map(vec2 p) {
            float f = texture(heightMap,p).r;
            return clamp(f, 0., 10.);
        }

        const mat2 m = mat2(0.72, -1.60, 1.60, 0.72);

        // 优化的水面映射函数 - 减少循环次数和复杂计算
        float water_map(vec2 p, float height) {
            vec2 p2 = p * large_wavesize;
            vec2 shift1 = 0.001 * vec2(iTime * 80.0, iTime * 60.0); // 减少时间乘数
            vec2 shift2 = 0.001 * vec2(iTime * 95.0, -iTime * 65.0); // 减少时间乘数

            // 简化的海洋波浪计算
            float f = 0.6000 * noise(p);
            f += 0.2500 * noise(p * m);
            // 移除第三层噪声以提高性能
            float wave = sin(p2.x * 0.622 + p2.y * 0.622 + shift2.x * 4.269) * large_waveheight * f * height;

            p *= small_wavesize;
            f = 0.;
            float amp = 1.0, s = .5;
            // 减少循环次数从9到5
            for(int i = 0; i < 5; i++) {
                p = m * p * .947;
                f -= amp * abs(sin((noise(p + shift1 * s) - .5) * 2.));
                amp = amp * .59;
                s *= -1.329;
            }

            return wave + f * small_waveheight;
        }

        // 优化的航海效果函数
        float nautic(vec2 p) {
            p *= 12.; // 减少缩放因子
            float f = 0.;
            float amp = 1.0, s = .5;
            // 减少循环次数从3到2
            for(int i = 0; i < 2; i++) {
                p = m * p * 1.2;
                f += amp * abs(smoothstep(0., 1., noise(p + iTime * s)) - .5);
                amp = amp * .5;
                s *= -1.227;
            }
            return pow(1. - f, 3.); // 减少幂次
        }

        // 优化的粒子效果函数
        float particles(vec2 p) {
            p *= 100.; // 减少缩放因子
            float f = 0.;
            float amp = 1.0, s = 1.5;
            // 减少循环次数从3到2
            for(int i = 0; i < 2; i++) {
                p = m * p * 1.2;
                f += amp * noise(p + iTime * s);
                amp = amp * .5;
                s *= -1.227;
            }
            return pow(f * .35, 5.) * particle_amount; // 减少幂次
        }

        // 优化的阴影测试函数
        float test_shadow(vec2 xy, float height) {
            vec3 r0 = vec3(xy, height);
            vec3 rd = normalize(light - r0);

            float hit = 1.0;
            float t = 0.001;
            // 减少循环次数从25到15
            for(int j = 1; j < 15; j++) {
                vec3 p = r0 + t * rd;
                float h = height_map(p.xy);
                float height_diff = p.z - h;
                if(height_diff < 0.0) {
                    return 0.0;
                }
                t += 0.02 + height_diff * .03; // 增加步长以减少迭代
                hit = min(hit, 3. * height_diff / t); // 调整软阴影计算
            }
            return hit;
        }
`;

export default class Erosion extends Cesium.Primitive {
  constructor(options) {
    super();
    this.viewer = options.viewer;
    this.extent = options.extent;
    this.maxElevation = options.maxElevation;
    this.minElevation = options.minElevation;
    this.heightMap = options.canvas;
    this.noise = options.noise;
    this.config = options.config|| {};

    // 性能优化：减少默认参数值，并正确初始化透明度
    this.coast2water_fadedepth = this.config.transparency !== undefined ? 
      this.config.transparency * 0.2 : 0.05; // 使用配置中的透明度或默认值
    this.large_waveheight = this.config.waveHeight || this.config.large_waveheight || 0.0;
    this.large_wavesize = this.config.textureScale || this.config.large_wavesize || 0.0;
    this.small_waveheight = (this.config.waveHeight || this.config.small_waveheight || 0.0) * 0.5;
    this.small_wavesize = (this.config.textureScale || this.config.small_wavesize || 0.0) * 2;
    this.water_softlight_fact = this.config.reflectivity !== undefined ? 
      20 + this.config.reflectivity * 80 : 24; // 使用配置中的反射率
    this.water_glossylight_fact = 80; // 减少从120到80
    this.particle_amount = 40; // 减少从70到40
    this.WATER_LEVEL = this.config.waterLevel || 0.16;
    this._showLines = false;

    // 性能优化：减少分辨率
    this.resolution = Cesium.defaultValue(
      options.resolution,
      new Cesium.Cartesian2(512, 512) // 减少从1024到512
    );

    // 添加性能控制变量
    this.lastUpdateTime = performance.now();
    this.deltaTime = 0;
    this.time = 0;
    this.frame = 0;
    this.updateInterval = 16; // 限制更新频率到60fps
    
    // 初始化动画相关参数
    this.animationSpeed = this.config.animationSpeed || 0.8;
    this.timeScale = this.config.timeScale || 1.0;
    
    // 初始化透明度参数
    this.transparency = this.config.transparency || 0.0;
  }
  createCommand(context) {
    // 性能优化：减少几何体复杂度
    const rectangle = new Cesium.RectangleGeometry({
      ellipsoid: Cesium.Ellipsoid.WGS84,
      rectangle: Cesium.Rectangle.fromDegrees(...this.extent),
      vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
      granularity: Cesium.Math.toRadians(0.001), // 增加粒度从0.0001到0.001以减少顶点数
      height: this.minElevation,
    });
    const geometry = Cesium.RectangleGeometry.createGeometry(rectangle);
    const attributeLocations =
      Cesium.GeometryPipeline.createAttributeLocations(geometry);

    const va = Cesium.VertexArray.fromGeometry({
      context: context,
      geometry: geometry,
      attributeLocations: attributeLocations,
    });
    const vs = `
        in vec4 position;
        in vec2 st;
        out vec2 v_st;

        const float PI = 3.141592653589793;
        const float earthRadius = 6378137.0; // WGS84 椭球体的平均半径
        const float angularVelocity = 180.0 / PI;

        const float RADII_X = 6378137.0;
        const float RADII_Y = 6378137.0;
        const float RADII_Z = 6356752.314245;

        vec3 worldToGeographic(vec3 worldPosition) {
            // 步骤1: 世界坐标到ECEF坐标
            vec3 ecef = worldPosition;  // 假设世界坐标已经是ECEF

            // 步骤2: ECEF到地理坐标
            float l = length(ecef.xy);
            float e2 = 1.0 - (RADII_Z * RADII_Z) / (RADII_X * RADII_X);
            float u = atan(ecef.z * RADII_X / (l * RADII_Z));
            float lat = atan((ecef.z + e2 * RADII_Z * pow(sin(u), 3.0)) / 
                            (l - e2 * RADII_X * pow(cos(u), 3.0)));
            float lon = atan(ecef.y, ecef.x);
            float N = RADII_X / sqrt(1.0 - e2 * sin(lat) * sin(lat));
            float alt = l / cos(lat) - N;

            // 将弧度转换为度
            lat = degrees(lat);
            lon = degrees(lon);

            return vec3(lon, lat, alt);
        }

        vec3 geo2cartesian(vec3 geo){
            float cosLat=cos(geo.y);
            float snX=cosLat*cos(geo.x);
            float snY=cosLat*sin(geo.x);
            float snZ=sin(geo.y);
            vec3 sn=normalize(vec3(snX,snY,snZ));
            vec3 radiiSquared=vec3(40680631.59076899*1000000.,40680631.59076899*1000000.,40408299.98466144*1000000.);
            vec3 sk=radiiSquared*sn;
            float gamma=sqrt(dot(sn,sk));
            sk=sk/gamma;
            sn=sn*geo.z;
            return sk+sn;
        }

        vec3 deg2cartesian(vec3 deg) {
            vec2 radGeo=radians(deg.xy);
            vec3 geo=vec3(radGeo.xy,deg.z);
            return geo2cartesian(geo);
        }

        void main() {
            float normalizedHeight = 0.0;

            vec2 uv = st;
            float deepwater_fadedepth = 0.5 + coast2water_fadedepth;

            float height = height_map(uv);
            vec3 col;

            float waveheight = clamp(WATER_LEVEL * 3. - 1.5, 0., 1.);
            float level = WATER_LEVEL + .2 * water_map(uv * 15. + vec2(iTime * .1), waveheight);

            if(height <= level) {
                normalizedHeight = level;
            }else{
                normalizedHeight = height; // 减少边缘拉伸的割裂感
            }

            float heightOffset = (maxElevation - minElevation) * normalizedHeight;
            
            // 将顶点位置从模型空间转换到世界空间
            vec4 worldPosition = czm_model * position;
            
            // 将世界坐标转换为经纬度和高度
            vec3 llh = worldToGeographic(worldPosition.xyz);
            
            // 将调整后的经纬度和高度转换回笛卡尔坐标
            vec3 adjustedCartesian = deg2cartesian(vec3(llh.xy,minElevation+heightOffset));
            
            gl_Position = czm_projection * czm_view * vec4(adjustedCartesian,1.0);
            v_st = st;
        }
      `;
    const fs = `
        in vec2 v_st;

        void main(){
            light = vec3(-0., .0, 2.8); // position of the sun
            vec2 uv = v_st;

            float deepwater_fadedepth = 0.5 + coast2water_fadedepth;

            float height = height_map(uv);
            vec3 col;

            float waveheight = clamp(WATER_LEVEL * 3. - 1.5, 0., 1.);
            float level = WATER_LEVEL + .2 * water_map(uv * 15. + vec2(iTime * .1), waveheight);
            if(height <= level) {
                vec2 dif = vec2(.0, .01);
                vec2 pos = uv * 15. + vec2(iTime * .01);
                float h1 = water_map(pos - dif, waveheight);
                float h2 = water_map(pos + dif, waveheight);
                float h3 = water_map(pos - dif.yx, waveheight);
                float h4 = water_map(pos + dif.yx, waveheight);
                vec3 normwater = normalize(vec3(h3 - h4, h1 - h2, .125)); // norm-vector of the 'bumpy' water-plane
                uv += normwater.xy * .002 * (level - height);

                col = vec3(1.0);

                float coastfade = clamp((level - height) / coast2water_fadedepth, 0., 1.);
                float coastfade2 = clamp((level - height) / deepwater_fadedepth, 0., 1.);
                float intensity = col.r * .2126 + col.g * .7152 + col.b * .0722;
                watercolor = mix(watercolor * intensity, watercolor2, smoothstep(0., 1., coastfade2));

                vec3 r0 = vec3(uv, WATER_LEVEL);
                vec3 rd = normalize(light - r0); // ray-direction to the light from water-position
                float grad = dot(normwater, rd); // dot-product of norm-vector and light-direction
                float specular = pow(grad, water_softlight_fact);  // used for soft highlights                          
                float specular2 = pow(grad, water_glossylight_fact); // used for glossy highlights
                float gradpos = dot(vec3(0., 0., 1.), rd);
                float specular1 = smoothstep(0., 1., pow(gradpos, 5.));  // used for diffusity (some darker corona around light's specular reflections...)                          
                float watershade = test_shadow(uv, level);
                watercolor *= 2.2 + watershade;
                watercolor += (.2 + .8 * watershade) * ((grad - 1.0) * .5 + specular) * .25;
                watercolor /= (1. + specular1 * 1.25);
                watercolor += watershade * specular2 * water_specularcolor;
                watercolor += watershade * coastfade * (1. - coastfade2) * (vec3(.5, .6, .7) * nautic(uv) + vec3(1., 1., 1.) * particles(uv));

                col = mix(col, watercolor, coastfade);
    
                // 修复透明度问题：使用透明度uniform和coastfade计算alpha值
                float baseAlpha = mix(0.3, 0.9, coastfade); // 基于coastfade的透明度范围
                float finalAlpha = baseAlpha * (1.0 - transparency); // 应用透明度配置
                out_FragColor = vec4(col, finalAlpha);
                return;
            }
        }
  
      `;
    const shaderProgram = Cesium.ShaderProgram.fromCache({
      context: context,
      vertexShaderSource: Common + vs,
      fragmentShaderSource: Common + fs,
      attributeLocations: attributeLocations,
    });
    // 性能优化：减少纹理分辨率
    const texture = new Cesium.Texture({
      context: context,
      width:  this.config.width || 1024, // 减少从2048到1024
      height: this.config.height || 1024, // 减少从2048到1024
      pixelFormat: Cesium.PixelFormat.RGBA,
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
      flipY: true,
      sampler: new Cesium.Sampler({
        minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
        magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
        wrapS: Cesium.TextureWrap.REPEAT,
        wrapT: Cesium.TextureWrap.REPEAT,
      }),
      source: this.heightMap,
    });
    // 性能优化：减少噪声纹理分辨率
    const noise = new Cesium.Texture({
      context: context,
      width: 256.0, // 减少从512到256
      height: 256.0, // 减少从512到256
      pixelFormat: Cesium.PixelFormat.RGBA,
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
      flipY: true,
      sampler: new Cesium.Sampler({
        minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
        magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR,
        wrapS: Cesium.TextureWrap.REPEAT,
        wrapT: Cesium.TextureWrap.REPEAT,
      }),
      source: this.noise,
    });
    const uniformMap = {
      heightMap: () => {
        return texture;
      },
      heightScale: () => 1.0,
      minElevation: () => this.minElevation,
      maxElevation: () => this.maxElevation,
      iTime: () => this.time,
      iChannel0: () => noise,
      coast2water_fadedepth: () => this.coast2water_fadedepth,
      large_waveheight: () => this.large_waveheight, // change to adjust the "heavy" waves
      large_wavesize: () => this.large_wavesize, // factor to adjust the large wave size
      small_waveheight: () => this.small_waveheight, // change to adjust the small random waves
      small_wavesize: () => this.small_wavesize, // factor to ajust the small wave size
      water_softlight_fact: () => this.water_softlight_fact, // range [1..200] (should be << smaller than glossy-fact)
      water_glossylight_fact: () => this.water_glossylight_fact, // range [1..200]
      particle_amount: () => this.particle_amount,
      WATER_LEVEL: () => this.WATER_LEVEL,
      transparency: () => this.transparency || 0.0, // 添加透明度uniform映射
    };
    const renderState = Cesium.RenderState.fromCache({
      depthTest: { enabled: true },
      depthMask: { enabled: true },
      blending: Cesium.BlendingState.ALPHA_BLEND,
      cull: {
        enabled: false,
      },
    });
    this.drawCommand = new Cesium.DrawCommand({
      modelMatrix: this.modelMatrix,
      vertexArray: va,
      primitiveType: Cesium.PrimitiveType.TRIANGLES, //TRIANGLES LINES
      shaderProgram: shaderProgram,
      uniformMap: uniformMap,
      renderState: renderState,
      pass: Cesium.Pass.OPAQUE,
    });
  }
  set showLines(value) {
    this._showLines = value;
    this.drawCommand.primitiveType = this._showLines
      ? Cesium.PrimitiveType.LINES
      : Cesium.PrimitiveType.TRIANGLES;
  }
  get showLines() {
    return this._showLines;
  }

  // 添加动态更新参数的方法
  updateParams(params) {
    if (!params) return;

    // 更新水体参数
    if (params.waterLevel !== undefined) {
      this.WATER_LEVEL = params.waterLevel;
    }
    if (params.waveHeight !== undefined) {
      this.large_waveheight = params.waveHeight;
      this.small_waveheight = params.waveHeight * 0.5; // 小波浪是大波浪的一半
    }
    if (params.waveSpeed !== undefined) {
      // 波浪速度影响时间缩放
      this.timeScale = params.waveSpeed * 50; // 调整缩放因子
    }
    if (params.transparency !== undefined) {
      this.transparency = params.transparency; // 直接设置透明度属性
      this.coast2water_fadedepth = params.transparency * 0.2; // 透明度影响海岸渐变
    }
    if (params.reflectivity !== undefined) {
      this.water_softlight_fact = 20 + params.reflectivity * 80; // 反射率影响软光照
    }
    if (params.textureScale !== undefined) {
      this.large_wavesize = params.textureScale;
      this.small_wavesize = params.textureScale * 2;
    }
    if (params.animationSpeed !== undefined) {
      this.animationSpeed = params.animationSpeed;
    }
    if (params.timeScale !== undefined) {
      this.timeScale = params.timeScale;
    }

    console.log("WaterErosion parameters updated:", params);
  }
  async update(frameState) {
    // 性能优化：限制更新频率
    const currentTime = performance.now();
    this.deltaTime = currentTime - this.lastUpdateTime;
    
    // 只在达到更新间隔时才更新
    if (this.deltaTime < this.updateInterval) {
      if (this.drawCommand) {
        frameState.commandList.push(this.drawCommand);
      }
      return;
    }
    
    this.lastUpdateTime = currentTime;
    this.time += this.deltaTime * 0.001; // 转换为秒
    this.frame++;
    
    if (!this.drawCommand) {
      this.createCommand(frameState.context);
    }
    frameState.commandList.push(this.drawCommand);
  }
  destroy() {
    super.destroy();
    const commondList = [this.drawCommand];
    commondList.forEach((drawCommand) => {
      if (drawCommand) {
        const va = drawCommand.vertexArray,
          sp = drawCommand.shaderProgram;
        if (!va.isDestroyed()) va.destroy();
        if (!sp.isDestroyed || !sp.isDestroyed()) {
          sp.destroy();
        }
        drawCommand.isDestroyed = function returnTrue() {
          return true;
        };
        drawCommand.uniformMap = undefined;
        drawCommand.renderState = Cesium.RenderState.removeFromCache(
          drawCommand.renderState
        );
      }
    });
    this.drawCommand = null;
  }
}
