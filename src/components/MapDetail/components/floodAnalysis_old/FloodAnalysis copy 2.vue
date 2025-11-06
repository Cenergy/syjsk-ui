<template>
    <div>
        <div class="flood-analysis-info">
            <div id="dat-gui-container"></div>
        </div>
    </div>
</template>

<script>
import { GUI } from 'lil-gui';

export default {
    data() {
        return {
            query: {
                hdnm: '',
                keyword: ''
            },
            data: [],
            rawData: [],
            gui: null,
            floodAnimationTimer: null, // 添加动画计时器
            isInitialized: false, // 添加初始化标志
            animationPaused: false, // 添加动画暂停状态
            floodParams: {
                waterHeight: 0.015,
                speed: 0.01,
                minHeight: 0.015,
                maxHeight: 2,
                animationEnabled: true,
                transparency: 0.7
            },
            rangeParams: {
                minHeight:[0.015,0.5],
                maxHeight:[0.05,2],
                waterHeight:[0.015,2],
                speed:[0.01,0.5],
                transparency:[0,1]
            }
        };
    },
    methods: {
        initDatGUI() {
            // 创建lil-gui实例
            this.gui = new GUI({ autoPlace: false });
            
            // 将GUI添加到指定容器
            const container = document.getElementById('dat-gui-container');
            if (container) {
                container.appendChild(this.gui.domElement);
            }
            
            // 添加控制项
            const waterFolder = this.gui.addFolder('水位控制');
            waterFolder.add(this.floodParams, 'waterHeight', ...this.rangeParams.waterHeight).name('当前水位(m)').onChange((value) => {
                if (this.isInitialized) {
                    this.updateFloodHeight(value);
                }
            });
            waterFolder.add(this.floodParams, 'minHeight', ...this.rangeParams.minHeight).name('最小高度(m)');
            waterFolder.add(this.floodParams, 'maxHeight', ...this.rangeParams.maxHeight).name('最大高度(m)');
            waterFolder.open();
            
            const animationFolder = this.gui.addFolder('动画控制');
            animationFolder.add(this.floodParams, 'speed', ...this.rangeParams.speed).name('动画速度').onChange((value) => {
                this.updateAnimationSpeed(value);
            });
            animationFolder.add(this.floodParams, 'animationEnabled').name('启用动画').onChange((value) => {
                this.toggleAnimation(value);
            });
            animationFolder.add(this.floodParams, 'transparency', ...this.rangeParams.transparency).name('透明度').onChange((value) => {
                this.updateTransparency(value);
            });
            animationFolder.open();
            
            // 延迟设置初始化标志，避免初始化时触发事件
            setTimeout(() => {
                this.isInitialized = true;
            }, 100);
            
            // 添加操作按钮
            const actions = {
                startFlood: () => this.startFloodAnalysis(),
                stopFlood: () => this.stopFloodAnalysis(),
                pauseFlood: () => this.pauseFloodAnalysis(),
                resumeFlood: () => this.resumeFloodAnalysis(),
                randomHeight: () => this.setRandomHeight(),
                reset: () => this.resetParams()
            };
            
            const controlFolder = this.gui.addFolder('操作控制');
            controlFolder.add(actions, 'startFlood').name('开始淹没分析');
            controlFolder.add(actions, 'stopFlood').name('停止淹没分析');
            controlFolder.add(actions, 'pauseFlood').name('暂停动画');
            controlFolder.add(actions, 'resumeFlood').name('继续动画');
            controlFolder.add(actions, 'randomHeight').name('随机水位');
            controlFolder.add(actions, 'reset').name('重置参数');
            controlFolder.open();
        },
        
        updateFloodHeight(height) {
            // 通过事件总线更新淹没高度
            this.$bus.emit('updateFloodHeight', height);
        },
        
        updateAnimationSpeed(speed) {
            // 通过事件总线更新动画速度
            this.$bus.emit('updateFloodSpeed', speed);
        },
        
        toggleAnimation(enabled) {
            // 通过事件总线切换动画状态
            this.$bus.emit('toggleFloodAnimation', enabled);
        },
        
        updateTransparency(transparency) {
            // 通过事件总线更新透明度
            this.$bus.emit('updateFloodTransparency', transparency);
        },
        
        startFloodAnalysis() {
            // 停止之前的动画（如果有）
            if (this.floodAnimationTimer) {
                clearInterval(this.floodAnimationTimer);
                this.floodAnimationTimer = null;
            }
            
            // 重置动画状态
            this.animationPaused = false;
            
            // 设置动画参数
            const startHeight = this.floodParams.minHeight;
            const targetHeight = this.floodParams.maxHeight;
            const animationDuration = 5000; // 5秒动画时长
            const frameRate = 60; // 60fps
            const totalFrames = (animationDuration / 1000) * frameRate;
            const heightIncrement = (targetHeight - startHeight) / totalFrames;
            
            let currentFrame = 0;
            let currentHeight = startHeight;
            
            // 初始化淹没分析
            this.$bus.emit('startFloodAnalysis', {
                height: startHeight,
                speed: this.floodParams.speed,
                transparency: this.floodParams.transparency
            });
            
            // 设置初始水位
            this.floodParams.waterHeight = startHeight;
            
            // 开始渐进式动画
            this.floodAnimationTimer = setInterval(() => {
                currentFrame++;
                currentHeight = startHeight + (heightIncrement * currentFrame);
                
                // 确保不超过目标高度
                if (currentHeight >= targetHeight) {
                    currentHeight = targetHeight;
                    clearInterval(this.floodAnimationTimer);
                    this.floodAnimationTimer = null;
                    this.animationPaused = false;
                }
                
                // 更新水位高度
                this.floodParams.waterHeight = Math.round(currentHeight * 100) / 100;
                this.updateFloodHeight(this.floodParams.waterHeight);
                
                // 更新GUI显示
                if (this.gui) {
                    this.gui.updateDisplay();
                }
            }, 1000 / frameRate);
        },
        
        pauseFloodAnalysis() {
            // 暂停动画
            if (this.floodAnimationTimer) {
                clearInterval(this.floodAnimationTimer);
                this.floodAnimationTimer = null;
                this.animationPaused = true;
            }
        },
        
        resumeFloodAnalysis() {
            // 继续动画（如果之前暂停了）
            if (this.animationPaused && !this.floodAnimationTimer) {
                const currentHeight = this.floodParams.waterHeight;
                const targetHeight = this.floodParams.maxHeight;
                
                if (currentHeight < targetHeight) {
                    const animationDuration = 5000; // 5秒动画时长
                    const frameRate = 60; // 60fps
                    const remainingHeight = targetHeight - currentHeight;
                    const heightIncrement = remainingHeight / ((animationDuration / 1000) * frameRate);
                    
                    this.floodAnimationTimer = setInterval(() => {
                        const newHeight = this.floodParams.waterHeight + heightIncrement;
                        
                        // 确保不超过目标高度
                        if (newHeight >= targetHeight) {
                            this.floodParams.waterHeight = targetHeight;
                            clearInterval(this.floodAnimationTimer);
                            this.floodAnimationTimer = null;
                            this.animationPaused = false;
                        } else {
                            this.floodParams.waterHeight = Math.round(newHeight * 100) / 100;
                        }
                        
                        this.updateFloodHeight(this.floodParams.waterHeight);
                        
                        // 更新GUI显示
                        if (this.gui) {
                            this.gui.updateDisplay();
                        }
                    }, 1000 / frameRate);
                }
            }
        },
        
        stopFloodAnalysis() {
            // 停止动画计时器
            if (this.floodAnimationTimer) {
                clearInterval(this.floodAnimationTimer);
                this.floodAnimationTimer = null;
            }
            
            // 重置动画状态
            this.animationPaused = false;
            
            // 停止淹没分析
            this.$bus.emit('stopFloodAnalysis');
        },
        
        setRandomHeight() {
            // 设置随机水位
            const randomHeight = Math.random() * (this.floodParams.maxHeight - this.floodParams.minHeight) + this.floodParams.minHeight;
            this.floodParams.waterHeight = Math.round(randomHeight * 10) / 10;
            this.updateFloodHeight(this.floodParams.waterHeight);
        },
        
        resetParams() {
            // 停止动画计时器
            if (this.floodAnimationTimer) {
                clearInterval(this.floodAnimationTimer);
                this.floodAnimationTimer = null;
            }
            
            // 重置所有参数
            this.floodParams = {
                waterHeight: 0.015,
                speed: 0.01,
                minHeight: 0.015,
                maxHeight: 2,
                animationEnabled: true,
                transparency: 0.7
            };
            
            // 更新GUI显示
            if (this.gui) {
                this.gui.updateDisplay();
            }
            
            // 停止淹没分析
            this.$bus.emit('stopFloodAnalysis');
        },
        
        getData() {
            // getRiverList()
            //     .then(res => {
            //         // console.log(res.data)
            //         this.rawData = res.data
            //         this.data = res.data
            //     })
        },
        isOver(row) {
            if(row.xxsw === null
            && row.xxsw === undefined) {
                return false
            }
            return row.rz >= row.xxsw
        },
        handleSearch() {
            const { keyword } = this.query
            this.data = this.rawData.filter(item=>{
                return item.rvName.includes(keyword)
            })
        },
        handleRowClick(row) {
            // const row = this.data[idx]
            this.$bus.emit("mapLocate", {
                type: 'River',
                data: row
            });
        },
        handleRowDblClick(row) {
            this.$bus.emit("openMapDialog", {
                handleField: 'rvCode',
                titleField: 'rvName',
                type: 'River',
                data: row
            });
        }
    },
    mounted() {
        this.getData();
        this.$nextTick(() => {
            this.initDatGUI();
        });
    },
    beforeDestroy() {
        // 停止动画计时器
        if (this.floodAnimationTimer) {
            clearInterval(this.floodAnimationTimer);
            this.floodAnimationTimer = null;
        }
        
        // 清理dat.gui实例
        if (this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
    }
};
</script>

<style scoped>
.flood-analysis-info {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.flood-analysis-info h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #4CAF50;
}

.flood-analysis-info p {
    margin: 0 0 15px 0;
    font-size: 14px;
    color: #ccc;
}

#dat-gui-container {
    width: 100%;
}

/* lil-gui 样式覆盖 */
#dat-gui-container .lil-gui {
    --background-color: rgba(0, 0, 0, 0.9);
    --text-color: #ffffff;
    --title-background-color: rgba(68, 175, 80, 0.8);
    --title-text-color: #ffffff;
    --widget-color: rgba(255, 255, 255, 0.1);
    --hover-color: rgba(255, 255, 255, 0.2);
    --focus-color: rgba(68, 175, 80, 0.6);
    --number-color: #4CAF50;
    --string-color: #81C784;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    width: 100%;
    margin: 0;
}
</style>