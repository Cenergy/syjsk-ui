import Vue from 'vue'

import Cookies from 'js-cookie'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css

import '@/assets/styles/sw.scss'
import './assets/css/YousheBiaoTiHei.css';
import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import plugins from './plugins' // plugins
import { download } from '@/utils/request'

import './assets/icons' // icon
import './permission' // permission control
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/system/config";
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, handleTree } from "@/utils/ruoyi";

import "leaflet/dist/leaflet.css"
// 分页组件
import Pagination from "@/components/Pagination";
// 自定义表格工具组件
import RightToolbar from "@/components/RightToolbar"
// 富文本组件
import Editor from "@/components/Editor"
// 文件上传组件
import FileUpload from "@/components/FileUpload"
// 图片上传组件
import ImageUpload from "@/components/ImageUpload"
// 图片预览组件
import ImagePreview from "@/components/ImagePreview"
// 字典标签组件
import DictTag from '@/components/DictTag'
// 头部标签组件
import VueMeta from 'vue-meta'
// 字典数据组件
import DictData from '@/components/DictData'
// 地图组件
// import LMap from '@/components/LMap/index.vue'
import ZebraTitle from '@/components/ZebraTitle/index.vue'
import DarkCard from '@/components/DarkCard/index.vue'
// import VueEcharts from '@/components/VueEcharts/index.vue'

import eventBus from '@/utils/EventBus'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.$bus = eventBus

// 全局组件挂载
// Vue.component('DictTag', DictTag)
// Vue.component('Pagination', Pagination)
// Vue.component('RightToolbar', RightToolbar)
// Vue.component('Editor', Editor)
// Vue.component('FileUpload', FileUpload)
// Vue.component('ImageUpload', ImageUpload)
// Vue.component('ImagePreview', ImagePreview)
// Vue.component('LMap', LMap)
Vue.component('ZebraTitle', ZebraTitle)
Vue.component('DarkCard', DarkCard)
// Vue.component('VueEcharts', VueEcharts)

Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
DictData.install()

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
