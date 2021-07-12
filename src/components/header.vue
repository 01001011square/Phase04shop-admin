<template>
  <div class="layout_header">

    <!-- ele-ui插件事件 command-->
    <el-dropdown @command="handleCommand">
      <span class="el-dropdown-link">
        {{ username }} <i class="el-icon-arrow-down el-icon--right"></i>
      </span>

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>登出</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapGetters,mapMutations } from "vuex";
export default {
  computed: {
    ...mapGetters(["username"]),
  },
  methods: {
    ...mapMutations(['clearinfo']),
    handleCommand(command) {
      this.clearinfo();
    },
  },
};
</script>

<style lang="stylus">
.layout_header {
  height: 60px;
  line-height: 60px;
  text-align: right;
}

.el-dropdown {
  cursor: pointer;
}
</style>