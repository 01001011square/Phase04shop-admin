<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary" @click="addRole()" class="addBtn">添加</el-button>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="rolename" label="角色名称" width="180">
      </el-table-column>
      <el-table-column label="状态" width="150">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status == 1" type="success" effect="dark">
            启用
          </el-tag>
          <el-tag v-else type="info" effect="dark"> 禁用 </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="editRole(scope.row.id)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="delRole(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对话框 -->
    <el-dialog
      @open="openFn"
      @close="closeFn"
      :title="info.isAdd ? '新增角色' : '编辑角色'"
      :visible.sync="info.isShow"
    >
      <el-form label-width="80px" :model="form" ref="ruleForm" :rules="rules">
        <el-form-item label="角色名称" prop="rolename">
          <el-input autocomplete="off" v-model="form.rolename"></el-input>
        </el-form-item>
        <el-form-item label="角色权限">
          <!-- element-ui中的树形数据 -->
          <el-tree
            :data="menuList"
            :props="{ label: 'title', children: 'children' }"
            show-checkbox
            node-key="id"
            ref="tree"
            check-strictly
            :default-checked-keys="defaultKeys"
          >
          </el-tree>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="info.isShow = false">取 消</el-button>
        <el-button type="primary" @click="submitRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
let defaultForm = {
  rolename: "",
  menus: "",
  status: true,
};

export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      tableData: [],
      // 编辑时显示默认勾选
      defaultKeys:[],
      // 菜单权限列表
      menuList: [],
      info: {
        isShow: false,
        isAdd: true,
      },
      form: { ...defaultForm },
      rules: {
        rolename: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 获取角色数据
    async getTData() {
      let res = await this.$http.get("/api/rolelist");
      // console.log(res);
      if (res.code == 200) {
        this.tableData = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },

    // 获取菜单权限列表
    async getMenus() {
      let res = await this.$http.get("/api/menulist", { istree: true });
      if (res.code == 200) {
        this.menuList = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },

    addRole() {
      this.info = {
        isShow: true,
        isAdd: true,
      };
    },
    openFn() {
      this.getMenus();
    },
    closeFn() {
      this.form = { ...defaultForm };
      this.defaultKeys = [];
    },
    submitRole() {
      // 获取被勾选项node-key组成的数据
      // console.log(this.$refs.tree.getCheckedKeys());
      this.$refs.ruleForm.validate(async (value) => {
        let url = this.info.isAdd ? "/api/roleadd" : "/api/roleedit";

        // 将数组转为字符串，接口要求字符串
        this.form.menus = this.$refs.tree.getCheckedKeys().join(",");
        this.form.status = this.form.status ? 1 : 2;
        let res = await this.$http.post(url, this.form);
        if (res.code == 200) {
          this.getTData();
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
        this.info.isShow = false;
      });
    },

    delRole(id) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await this.$http.post("/api/roledelete", { id });
          if (res.code == 200) {
            this.getTData();
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
    async editRole(id) {
      this.info = {
        isShow: true,
        isAdd: false,
      };
      let res = await this.$http.get("/api/roleinfo", { id });
      if (res.code == 200) {
        this.form = {
          id,
          rolename: res.list.rolename,
          status: res.list.status === 1 ? true : false,
        };
        this.defaultKeys = res.list.menus.split(",");
        console.log(this.form);
      } else {
        this.$message.error(res.msg);
      }
    },
  },
};
</script>