// 修改后的代码，支持不同雨量级别
export function addRainAnimation(viewer, type) {
  // 移除现有的雨效果
  removeRainAnimation(viewer);

  // 根据雨量级别设置参数
  let density, speed, size, mixFactor;
  switch (type) {
    case "small": // 小雨
      density = 30.0;
      speed = 10.0;
      size = 15;
      mixFactor = 0.3;
      break;
    case "medium": // 大雨
      density = 70.0;
      speed = 15.0;
      size = 15.0;
      mixFactor = 0.5;
      break;
    case "heavy": // 大雨
      density = 150.0;
      speed = 25.0;
      size = 20.0;
      mixFactor = 0.7;
      break;
    default:
      density = 100.0;
      speed = 15.0;
      size = 15.0;
      mixFactor = 0.5;
  }

  var e = new Cesium.PostProcessStage({
    name: "czm_rain",
    fragmentShader: getRainShader(density, speed, size, mixFactor),
  });

  viewer.scene.postProcessStages.add(e);

  // 返回实例以便后续控制
  return e;
  function getRainShader(density, speed, size, mixFactor) {
    return `
#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    precision highp int;
#else
    precision mediump float;
    precision mediump int;
    #define highp mediump
#endif

uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;
out vec4 fragColor;

float hash(float x) {
    return fract(sin(x*133.3)*13.13);
}

void main(void) {
    float time = czm_frameNumber / 60.0;
    vec2 resolution = czm_viewport.zw;
    
    vec2 uv = (gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
    vec3 c = vec3(.6,.7,.8);
    
    float a = -.4;
    float si = sin(a), co = cos(a);
    uv *= mat2(co,-si,si,co);
    uv *= length(uv+vec2(0,4.9))*.3+1.;
    
    float densityVal = ${density.toFixed(1)};
    float speedVal = ${speed.toFixed(1)};
    float sizeVal = ${size.toFixed(1)};  
    float mixFactorVal = ${mixFactor.toFixed(1)};
    
    float v = 1.-sin(hash(floor(uv.x*densityVal))*densityVal);
    float b = clamp(abs(sin(speedVal*time*v+uv.y*(sizeVal/(2.+v))))-.95,0.,1.)*4.;
    c *= v*b; 
    
    fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,1), mixFactorVal);  
}
`;
  }
  //   function getRainShader(density, speed, size, mixFactor) {
  //     return`
  // #version 300 es
  // #ifdef GL_FRAGMENT_PRECISION_HIGH
  //     precision highp float;
  //     precision highp int;
  // #else
  //     precision mediump float;
  //     precision mediump int;
  //     #define highp mediump
  // #endif

  // uniform sampler2D colorTexture;
  // in vec2 v_textureCoordinates;
  // out vec4 fragColor;

  // float hash(float x) {
  //     return fract(sin(x*133.3)*13.13);
  // }

  // void main(void) {
  //     float time = czm_frameNumber / 60.0;
  //     vec2 resolution = czm_viewport.zw;

  //     vec2 uv = (gl_FragCoord.xy*2.0-resolution.xy)/min(resolution.x,resolution.y);
  //     vec3 rainColor = vec3(0.6,0.7,0.8);

  //     float angle = -0.4;
  //     float si = sin(angle), co = cos(angle);
  //     uv *= mat2(co,-si,si,co);
  //     uv *= length(uv+vec2(0.0,4.9))*0.3+1.0;

  //     // 修复类型错误：确保所有数值都是浮点数
  //     float densityVal = ${density.toFixed(1)};
  //     float speedVal = ${speed.toFixed(1)};
  //     float sizeVal = ${size.toFixed(1)};
  //     float mixFactorVal = ${mixFactor.toFixed(1)};

  //     float v = 1.0 - sin(hash(floor(uv.x * densityVal))) * densityVal;
  //     float b = clamp(abs(sin(speedVal * time * v + uv.y * (sizeVal/(2.0+v))))-0.95, 0.0, 1.0)*4.0;
  //     rainColor *= v * b;

  //     fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(rainColor,1.0), mixFactorVal);
  // }
  // `;
  //   }
}

// 移除雨动画的函数保持不变
export function removeRainAnimation(viewer) {
  if (!viewer || !viewer.scene || !viewer.scene.postProcessStages) return;

  const stage = viewer.scene.postProcessStages.getStageByName("czm_rain");
  if (stage) {
    viewer.scene.postProcessStages.remove(stage);
    stage.destroy();
  }
}

// 导出函数
export default {
  addRainAnimation,
  removeRainAnimation,
};
