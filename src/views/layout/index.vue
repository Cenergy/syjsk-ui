<template>
  <el-container style="height: 100vh; min-width: 1600px; min-height: 900px" class="mainContainer">
    <el-header class="header" height="80px">
      <div class="navbar" style="justify-content: flex-end">
        <router-link to="/index" custom v-slot="{ navigate, isActive }">
          <div :class="['nav-item2', isActive && 'active']" @click="navigate">首页</div>
        </router-link>
        <router-link to="/four-quan" custom v-slot="{ navigate, isActive }">
          <div :class="['nav-item-dark', isActive && 'active']" @click="navigate">
            四全
            <!-- <ul class="submenu">
                    <li class="submenu-item">全覆盖</li>
                    <li class="submenu-item">全要素</li>
                    <li class="submenu-item">全天候</li>
                    <li class="submenu-item">全周期</li>
                </ul> -->
          </div>
        </router-link>
        <router-link to="/four-zhi" custom v-slot="{ navigate, isActive }">
          <div :class="['nav-item-dark', isActive && 'active']" @click="navigate">四制</div>
        </router-link>
      </div>
      <div class="title-container">
        <strong class="title">上犹江水库一张图(上游淹没部分)</strong>
      </div>
      <div class="navbar" style="justify-content: flex-start">
        <router-link to="/four-yu" custom v-slot="{ navigate, isActive }">
          <div :class="['nav-item-dark', 'right', isActive && 'active']" @click="navigate">
            四预
            <!-- <ul class="submenu">
                    <li class="submenu-item">预报</li>
                    <li class="submenu-item">预警</li>
                    <li class="submenu-item">预演</li>
                    <li class="submenu-item">预案</li>
                </ul> -->
          </div>
        </router-link>
        <router-link to="/four-guan" custom v-slot="{ navigate, isActive }">
          <div :class="['nav-item-dark', 'right', isActive && 'active']" @click="navigate">
            四管
            <!-- <ul class="submenu">
                    <li class="submenu-item">水库除险</li>
                    <li class="submenu-item">安全体检</li>
                    <li class="submenu-item">维修养护</li>
                    <li class="submenu-item">安全保障</li>
                </ul> -->
          </div>
        </router-link>
        <router-link to="/data-mgn" custom v-slot="{ navigate, isActive }">
          <div :class="['nav-item-dark', 'right', isActive && 'active']" @click="navigate">
            数据管理
          </div>
        </router-link>
      </div>
      <!-- <strong class="title">公明水库数字孪生平台</strong> -->
      <!-- <div class="navbar">
            <router-link
            to="/index"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/overview.png" class="nav-item__icon" alt="">
                    <strong>首页</strong>
                </div>
            </router-link>
            <router-link
            to="/one-map"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/overview.png" class="nav-item__icon" alt="">
                    <strong>信息总览</strong>
                </div>
            </router-link>
            <router-link
            to="/flood-forecast"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/safe.png" class="nav-item__icon" alt="">
                    <strong>洪水预报</strong>
                </div>
            </router-link>
            <router-link
            to="/safe-mgn"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/safe.png" class="nav-item__icon" alt="">
                    <strong>大坝安全</strong>
                </div>
            </router-link>
            <router-link
            to="/water-quality-mgn"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/quality.png" class="nav-item__icon" alt="">
                    <strong>水质管理</strong>
                </div>
            </router-link> -->
      <!-- <router-link
            to="/regulate-storage-mgn"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/regular.png" class="nav-item__icon" alt="">
                    <strong>调蓄管理</strong>
                </div>
            </router-link>
            <router-link
            to="/run-mgn"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/running.png" class="nav-item__icon" alt="">
                    <strong>运行管理</strong>
                </div>
            </router-link> -->
      <!-- <router-link
            to="/daily-mgn"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/setting.png" class="nav-item__icon" alt="">
                    <strong>日常管理</strong>
                </div>
            </router-link>
            <router-link
            to="/data-mgn"
            custom
            v-slot="{ navigate, isActive }">
                <div :class="['nav-item', isActive&&'active']"
                @click="navigate">
                    <img src="@/assets/icons/png/data-mgn.png" class="nav-item__icon" alt="">
                    <strong>档案管理</strong>
                </div>
            </router-link> -->
      <!-- </div> -->
      <div class="header-foot">
        <el-dropdown @command="handleCommandSystemBar">
          <el-avatar>{{ nickName }}</el-avatar>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="setting">系统设置</el-dropdown-item>
            <el-dropdown-item command="logout">退出系统</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main">
      <router-view></router-view>
    </el-main>
    <FooterBar  :tab-list="[]"/>
  </el-container>
</template>
<script>
import FooterBar from "@/components/FooterBar";
export default {
  components: {FooterBar},
  data() {
    return {
      sysSrc: "http://192.168.18.22:8081/gongmin/",
      isOpenDialogDBAQ: false,
      isFullScreen: false,
    };
  },
  computed: {
    nickName() {
      return this.$store.getters.nickName || "默认用户";
    },
  },
  mounted() {
    this.$bus.on("OpenDamSafetyModel", this.handleOpenDialog);
  },
  destroyed() {
    this.$bus.off("OpenDamSafetyModel", this.handleOpenDialog);
  },
  methods: {
    handleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
    },
    handleOpenDialog(data) {
      const { dmbm, dbcode, czbm } = data;
      if (!czbm) {
        this.$bus.emit("UEOpenDamMonitorDialog", data);
        return;
      }
      let role = sessionStorage.getItem("role");
      let afterLink = "";
      if (role == "admin") {
        afterLink = "/admin/Gmsk%21%402025";
      } else {
        afterLink = "/cc/gm123";
      }
      if (czbm == "detail") {
        this.sysSrc = `http://192.168.18.22:8081/gongmin/page1/1001` + afterLink;
        this.isOpenDialogDBAQ = true;
        return;
      }

      this.isOpenDialogDBAQ = true;

      function normalizeUnicode(str) {
        const noSpace = str.replace(/\s/g, "");
        return noSpace.normalize("NFKC");
      }
    },
    toSystemMgn() {
      this.$router.push("/system/index");
    },
    changePassword() {
      this.$router.push("/login");
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        this.$router.push("/login");
      });
    },
    handleCommandSystemBar(cmd) {
      switch (cmd) {
        case "setting":
          this.toSystemMgn();
          break;
        case "logout":
          this.logout();
          break;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  // padding: 0;
}

.header {
  background-image: url(../../assets/images/header/background2.png),
    linear-gradient(180deg, #172b4e 0%, rgba(23, 43, 78, 0) 100%);
  background-size: 100% 100%;
  width: 100%;
  display: flex;
  align-items: center;
  z-index: 4;
  position: relative;
}

.title-container {
  flex: 1.3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
}

.navbar {
  display: flex;
  flex: 1;
}

.nav-item {
  position: relative;
  cursor: pointer;
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 15px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  transition: 0.2s background-image;

  & + .nav-item {
    margin-left: 12px;
  }

  .nav-item__icon {
    width: 30px;
    // height: 30px;
  }

  &:hover,
  &.active {
    color: #ffffff;
  }

  &.active {
    background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 100%
    );
    border-bottom: 2px solid #fff;
  }
}

.nav-item2 {
  position: relative;
  width: 150px;
  padding: 7px 0px;
  text-align: center;
  cursor: pointer;
  color: white;
  font-family: "微软雅黑";
  font-weight: 600;
  background-size: 100% 100%;
  background-image: url(../../assets/images/header/navitem.png);

  & + .nav-item2 {
    margin: 0px 5px;
  }

  &.right {
    background-image: url(../../assets/images/header/navitem-right.png);

    &.active {
      background-image: url(../../assets/images/header/navitem-right-active.png);
    }
  }

  &.active {
    background-image: url(../../assets/images/header/navitem-active.png);
  }

  &:hover {
    > .submenu {
      display: block;
    }
  }
}

.nav-item-dark {
  position: relative;
  width: 150px;
  padding: 7px 0px;
  text-align: center;
  cursor: pointer;
  color: gray;
  font-family: "微软雅黑";
  font-weight: 600;
  background-size: 100% 100%;
  background-image: url(../../assets/images/header/navitem.png);
  filter:grayscale(100%);

  & + .nav-item-dark {
    margin: 0px 5px;
  }

  &.right {
    background-image: url(../../assets/images/header/navitem-right.png);
    filter:grayscale(100%);

    &.active {
      color:white;
      filter:none;
      background-image: url(../../assets/images/header/navitem-right-active.png);
    }
  }

  &.active {
    color:white;
    filter:none;
    background-image: url(../../assets/images/header/navitem-active.png);
  }

  &:hover {
    > .submenu {
      display: block;
    }
  }
}

.submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  padding: 5px;
  margin: 0;
  border: 1px solid #335c94;
  border-radius: 2px;
  background-color: #041a388f;

  > .submenu-item {
    width: 100%;
    list-style: none;
    color: #fff;
    text-align: center;
    padding: 5px;
    background: linear-gradient(0deg, rgba(27, 46, 75, 0.7), rgba(27, 46, 75, 0.7)),
      linear-gradient(90deg, rgba(42, 88, 162, 0.9) 13.35%, rgba(25, 58, 109, 0) 75.66%);

    border: 1px solid #2aa0a1e5;
    border-radius: 2px;

    margin-top: 3px;

    &:hover,
    &.active {
      background: linear-gradient(0deg, rgba(27, 74, 75, 0.7), rgba(27, 74, 75, 0.7)),
        linear-gradient(
          90deg,
          rgba(42, 160, 162, 0.9) 13.35%,
          rgba(25, 108, 109, 0) 75.66%
        );
    }
  }
}

.header-foot {
  position: absolute;
  top: 50px;
  right: 20px;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  color: #66b4f2;
  font-size: 2rem;
  transform: translateY(-50%);
}

.main {
  padding: 0;
  color: #fff;
  // z-index: 2;
}
.mainContainer{
   background-color: rgba(0, 0, 0, 0.8);
}
</style>
