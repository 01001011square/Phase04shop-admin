<template>
  <div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <!-- prop:这一列数据关联的数据名称(接口对应字段) -->
      <!-- label:标题 -->
      <el-table-column prop="title" label="名称" width="180"></el-table-column>
      <el-table-column label="图标" width="180">
        <!-- 使用作用域插槽，数据可以暴露在子组件，利用scope来获取数据 -->
        <template slot-scope="scope">
          <!-- scope.row:当前行的数据 icon:接口对应字段 -->
          <i :class="scope.row.icon"></i>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="180">
        <template slot-scope="scope">
          <!-- scope.row:当前行的数据 type:接口对应字段 -->
          <el-tag v-if="scope.row.type == 1">目录</el-tag>
          <el-tag v-else type="success">菜单</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="菜单URL" width="180"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editMenu(scope.row.id)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="delMenu(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    tableData: Array,
  },
  methods: {
    editMenu(id) {
      this.$emit("editMenu", id);
    },
    delMenu(id) {
      this.$confirm("此操作将永久删除该菜单, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await axios.post("/api/menudelete", { id });
          if (res.code == 200) {
            this.$emit("getTData");
            this.$message({
              type: "success",
              message: "删除成功!",
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>