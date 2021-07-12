<template>
  <div class="layout_bg">
    <el-container class="layout_container">
      <el-aside width="250px">
        <v-aside></v-aside>
      </el-aside>
      <el-container>
        <el-header class="header">
          <v-header></v-header>
        </el-header>
        <el-main class="main_wrapper"><router-view></router-view></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import vHeader from '@/components/header'
import vAside from '@/components/aside'
export default {
    components:{
        vHeader,
        vAside
    }
}
</script>

<style lang="stylus" scoped>
.layout_bg {
  height: 100%;

  .layout_container {
    height: 100%;

    .header {
      background: #b3c0d1;
    }

    .main_wrapper {
      background: #e5e5e5;
    }
  }
}</style>
