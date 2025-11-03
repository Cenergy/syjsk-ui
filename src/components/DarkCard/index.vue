<template>
  <div class="dark-card">
    <div class="dark-card-head">
      <!-- <ZebraTitle :border="false">
             
            </ZebraTitle> -->
      <div class="mainTitle">
        <div style="display: flex; align-items: center">
          <slot name="icon"></slot>
          <span class="title" style="margin-left: 5px">{{ title }}</span>
        </div>
        <span>{{ extra }}</span>
      </div>
      <!-- <div class="title">
            <slot name="icon"></slot>
            <span style="margin-left: 5px;">{{ title }}</span>
        </div> -->
    </div>
    <div class="dark-card-body">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    extra: {
      type: String,
      default: "",
    },
  },
};
</script>
<style lang="scss" scoped>
.dark-card {
  box-shadow: inset 0 0 5px 1px #56a2f3;
  color: #000;
  box-sizing: border-box;
  overflow: hidden;
}

.dark-card-head {
  position: relative;
  padding: 3px 10px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.24) 0%,
    rgba(255, 255, 255, 0.01) 50%
  );
  background-size: 100% 100%;
  background-image: url(../../assets/images/card-head.png);
  color: #fff;

  &::after {
    position: absolute;
    left: 0;
    bottom: 0;
    display: block;
    content: "";
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(52, 142, 230, 0) 0%,
      rgba(56, 156, 255, 0.75) 75%,
      rgba(255, 255, 255, 0.5) 90%
    );
  }

  > .title {
    font-size: 16px;
    color: #000;
    display: flex;
    align-items: center;
  }

  img {
    height: 20px;
  }
}

.mainTitle {
  height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // background: url('../../assets/images/partTitlebg.png');

  //   background-size: 50% 100%;
  background-repeat: no-repeat;
  .title {
    font-family: AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    text-indent: 10px;
    // color: rgba(60, 83, 104, 1);
    color: #fff;
  }
}

.dark-card-body {
  //   background: #fff;
  color: #fff;
  height: calc(100% - 37px);
  padding: 5px 10px;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
