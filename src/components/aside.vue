<template>
  <div class="nav">
    <el-menu
      unique-opened
      background-color="#20222a"
      text-color="#fff"
      class="el_menu"
    >
      <h2>后台管理系统</h2>
      <el-menu-item>
        <router-link to="/index" index="/index">
          <i class="el-icon-s-home"></i>
          <span>首页</span>
        </router-link>
      </el-menu-item>

      <!-- 包含子菜单的导航栏 -->
      <el-submenu
        v-for="(submenu, index) in menus"
        :key="index"
        :index="(index + 1).toString()"
      >
        <!-- 一级导航 -->
        <template slot="title">
          <i :class="submenu.icon"></i>
          <span>{{ submenu.title }}</span>
        </template>

        <!-- 二级导航 -->
        <el-menu-item
          v-for="(item, index) in submenu.children"
          :key="index"
          :index="item.url"
        >
          <router-link :to="item.url">
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </router-link>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  computed: {
    // 从vuex的getters中取得的可访问菜单
    ...mapGetters(["menus"]),
  },
};
</script>

<style lang="stylus">
.nav {
  height: 100%;
  overflow hidden
  .el_menu {
    width: 100%;
    height: 100%;

    h2 {
      color: #ffffff;
      font-size: 16px;
      font-weight: normal;
      height: 60px;
      line-height: 60px;
      padding-left: 24px;
    }

    .el-menu-item {
      .router-link-active {
        color: #ffd04b;

        i {
          color: #ffd04b;
        }
      }
    }

    a {
      text-decoration: none;
      color: #ffffff;
    }
  }
}
</style>