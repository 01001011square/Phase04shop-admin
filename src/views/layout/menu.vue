<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary" @click="addMenu()" class="addBtn">添加</el-button>
    <v-table :tableData="tableData" @editMenu="editMenu" @getTData="getTData"></v-table>
    <v-dialog :info="info" ref="dialog" @getTData="getTData"></v-dialog>
  </div>
</template>

<script>
import vTable from "./menu/table";
import vDialog from "./menu/dialog";
import axios from "axios";

export default {
  data() {
    return {
      tableData: [],
      info: {
        isShow: false, // dialog显示
        isAdd: true, // 判断是添加或编辑
      },
    };
  },
  methods: {
    // 获取树形数据
    async getTData() {
      let res = await axios.get("/api/menulist", { params: { istree: true } });
      if (res.code == 200) {
        this.tableData = res.list;
      } else {
        this.$message.error(res.msg);
      }
    },
    // 点击添加菜单
    addMenu() {
      this.info = {
        isShow: true,
        isAdd: true,
      };
    },
    // table子组件编辑按钮
    async editMenu(id) {
      this.info = {
        isShow: true,
        isAdd: false,
      };

      let res = await axios.get("/api/menuinfo", { params: { id } });
      if (res.code == 200) {
        // 获取后整理表单中的数据
        this.$refs.dialog.form = {
          id,
          ...res.list,
          status: res.list.status === 1 ? true : false,
        };
      } else {
        this.$message.error(res.msg);
      }
    },
  },
  // 组件实例创建完成后拉数据
  created() {
    this.getTData();
  },
  components: {
    vTable,
    vDialog,
  },
};
</script>