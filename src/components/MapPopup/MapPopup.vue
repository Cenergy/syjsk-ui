<template>
  <el-dialog
    ref="dialogRef"
    :title="title"
    :visible.sync="isOpen"
    :close-on-click-modal="false"
    :width="width"
    :center="true"
    append-to-body
    class="dark"
    custom-class="no-padding"
    :style="{
      transform: scale,
    }"
    @closed="handleClose"
  >
    <div class="el-dialog-div">
      <component :is="popup"></component>
    </div>
  </el-dialog>
</template>
<script>
import * as Popups from "./index";

const tp2Popup = {
  Reservoir: Popups.RsvrPopup,
  FloodStatistical: Popups.FloodStatistical,
};

export default {
  components: Popups,
  data() {
    return {
      isOpen: false,
      popup: null,
      title: "",
      stcd: "",
      width: "1000px",
      scale: 1,
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    toggle() {
      this.isOpen = !this.isOpen;
    },
    setTitle(title) {
      this.title = title;
    },
    setWidth(width) {
      this.width = width;
      // this.$nextTick(()=>{
      //     const dragDom = this.$refs.dialogRef.$el.querySelector(".el-dialog")
      //     dragDom.style.left = `${(document.body.clientWidth - dragDom.clientWidth) / 2}px`;
      // })
    },
    handleOpen(eventData) {
      console.log(eventData);
      const { handleField = "stcd", titleField = "stnm", type, data } = eventData;
      this.stcd = data[handleField];
      this.title = data[titleField];
      this.popup = tp2Popup[type];
      this.open();
    },
    handleClose() {
      this.title = "";
      this.popup = null;
      this.close();
    },
    getStcd() {
      return this.stcd;
    },
  },
  provide() {
    return {
      openPopup: this.open,
      closePopup: this.close,
      togglePopup: this.toggle,
      setTitle: this.setTitle,
      getStcd: this.getStcd,
      setWidth: this.setWidth,
    };
  },
  mounted() {
    this.$refs.dialogRef.$el.querySelector(".el-dialog").style.transform = `scale(${
      window.innerWidth / 1920
    })`;
    this.$refs.dialogRef.$el.querySelector(
      ".el-dialog"
    ).style.transformOrgin = `center center`;
    this.$bus.on("openMapDialog", this.handleOpen);
    console.log("map-popup created");
  },
  destroyed() {
    this.$bus.off("openMapDialog", this.handleOpen);
  },
};
</script>
<style scoped>
.dark {
  font-size: 16px !important;
}
.el-dialog-div {
  max-height: 80vh;
  overflow-x: hidden;
}

/* 深色风格弹窗样式 */
::v-deep .el-dialog {
  background-color: rgba(4, 26, 56, 0.85) !important;
  border: 1px solid #335c94;
  border-radius: 8px;
  box-shadow: inset 0 0 5px 1px #56a2f3;
}

/* 弹窗标题样式 */
::v-deep .el-dialog__header {
  background: linear-gradient(0deg, rgba(27, 46, 75, 0.7), rgba(27, 46, 75, 0.7)),
    linear-gradient(90deg, rgba(42, 88, 162, 0.9) 13.35%, rgba(25, 58, 109, 0) 75%) !important;
  border: 1px solid #50beff;
  border-bottom: 1px solid #56a2f3;
  padding: 20px !important;
  border-radius: 8px 8px 0 0;
}

::v-deep .el-dialog__title {
  color: #50beff !important;
  font-size: 16px;
  font-weight: 500;
}

/* 关闭按钮样式 */
::v-deep .el-dialog__headerbtn {
  top: 16px;
  right: 20px;
}

::v-deep .el-dialog__close {
  color: #50beff !important;
  font-size: 18px;
}

::v-deep .el-dialog__close:hover {
  color: #ffffff !important;
}

/* 弹窗内容区域 */
::v-deep .el-dialog__body {
  padding: 0 !important;
  background-color: rgba(4, 26, 56, 0.85) !important;
  color: #ffffff !important;
}

/* 内容容器样式 */
.el-dialog-div {
  max-height: 80vh;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: rgba(4, 26, 56, 0.85) !important;
  color: #ffffff !important;
  padding: 0px;
}

/* 全局深色背景覆盖 */
::v-deep .el-dialog-div * {
  background-color: transparent !important;
  color: #ffffff !important;
}

/* 表格样式 */
::v-deep .el-dialog-div table {
  width: 100%;
  border-collapse: collapse;
  color: #ffffff !important;
  background-color: rgba(4, 26, 56, 0.85) !important;
}

::v-deep .el-dialog-div table th,
::v-deep .el-dialog-div table td {
  border: 1px solid #335c94 !important;
  padding: 8px 12px;
  text-align: left;
  background-color: rgba(4, 26, 56, 0.85) !important;
  color: #ffffff !important;
}

::v-deep .el-dialog-div table th {
  background: linear-gradient(0deg, rgba(27, 46, 75, 0.7), rgba(27, 46, 75, 0.7)),
    linear-gradient(90deg, rgba(42, 88, 162, 0.9) 13.35%, rgba(25, 58, 109, 0) 75%) !important;
  border: 1px solid #50beff !important;
  font-weight: 500;
  color: #50beff !important;
}

::v-deep .el-dialog-div table tr:nth-child(even) td {
  background-color: rgba(27, 46, 75, 0.3) !important;
}

/* 标签页样式 */
::v-deep .el-dialog-div .el-tabs {
  background-color: rgba(4, 26, 56, 0.85) !important;
}

::v-deep .el-dialog-div .el-tabs__header {
  background: linear-gradient(0deg, rgba(27, 46, 75, 0.7), rgba(27, 46, 75, 0.7)),
    linear-gradient(90deg, rgba(42, 88, 162, 0.9) 13.35%, rgba(25, 58, 109, 0) 75%) !important;
  margin: 0 0 15px 0;
  border-radius: 4px;
  border: 1px solid #50beff;
}

::v-deep .el-dialog-div .el-tabs__nav {
  background-color: transparent !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
}

::v-deep .el-dialog-div .el-tabs__item {
  color: #cccccc !important;
  background-color: transparent !important;
  border: 1px solid #335c94 !important;
  border-radius: 4px;
  padding: 12px 20px;
  margin: 2px;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  line-height: 1 !important;
}

::v-deep .el-dialog-div .el-tabs__item.is-active {
  color: #50beff !important;
  background: linear-gradient(0deg, rgba(27, 74, 75, 0.7), rgba(27, 74, 75, 0.7)),
    linear-gradient(90deg, rgba(42, 160, 162, 0.9) 13.35%, rgba(25, 108, 109, 0) 75%) !important;
  border: 1px solid #50ffd7 !important;
  border-radius: 4px;
}

::v-deep .el-dialog-div .el-tabs__item:hover {
  color: #50beff !important;
  background-color: rgba(27, 46, 75, 0.5) !important;
  border-radius: 4px;
}

::v-deep .el-dialog-div .el-tabs__active-bar {
  display: none;
}

::v-deep .el-dialog-div .el-tabs__nav-wrap::after {
  display: none;
}

::v-deep .el-dialog-div .el-tabs__content {
  background-color: rgba(4, 26, 56, 0.85) !important;
}

::v-deep .el-dialog-div .el-tab-pane {
  background-color: rgba(4, 26, 56, 0.85) !important;
}

/* 左侧导航区域样式 */
::v-deep .el-dialog-div .el-tabs--left .el-tabs__nav-wrap {
  background: linear-gradient(0deg, rgba(27, 46, 75, 0.7), rgba(27, 46, 75, 0.7)),
    linear-gradient(90deg, rgba(42, 88, 162, 0.9) 13.35%, rgba(25, 58, 109, 0) 75%) !important;
  border: 1px solid #50beff;
  border-radius: 4px;
}

::v-deep .el-dialog-div .el-tabs--left .el-tabs__nav-scroll {
  background-color: transparent !important;
}

::v-deep .el-dialog-div .el-tabs--left .el-tabs__nav {
  background-color: transparent !important;
}

::v-deep .el-dialog-div .el-tabs--left .el-tabs__content {
  background-color: rgba(4, 26, 56, 0.85) !important;
  padding-left: 20px;
}

/* 文本样式 */
::v-deep .el-dialog-div p,
::v-deep .el-dialog-div div,
::v-deep .el-dialog-div span,
::v-deep .el-dialog-div h1,
::v-deep .el-dialog-div h2,
::v-deep .el-dialog-div h3,
::v-deep .el-dialog-div h4,
::v-deep .el-dialog-div h5,
::v-deep .el-dialog-div h6 {
  color: #ffffff !important;
}

/* 输入框和表单元素 */
::v-deep .el-dialog-div .el-input__inner {
  background-color: rgba(27, 46, 75, 0.7) !important;
  border-color: #335c94 !important;
  color: #ffffff !important;
}

::v-deep .el-dialog-div .el-select .el-input__inner {
  background-color: rgba(27, 46, 75, 0.7) !important;
  border-color: #335c94 !important;
  color: #ffffff !important;
}

/* 自定义滚动条 */
.el-dialog-div::-webkit-scrollbar {
  width: 8px;
}

.el-dialog-div::-webkit-scrollbar-track {
  background: rgba(27, 46, 75, 0.7);
  border-radius: 4px;
}

.el-dialog-div::-webkit-scrollbar-thumb {
  background: #50beff;
  border-radius: 4px;
}

.el-dialog-div::-webkit-scrollbar-thumb:hover {
  background: #4a8fd9;
}

/* 确保所有子元素都是深色背景 */
::v-deep .el-dialog-div > * {
  background-color: rgba(4, 26, 56, 0.85) !important;
}
</style>
