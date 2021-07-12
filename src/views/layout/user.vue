<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>管理员列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary" @click="addUser()" class="addBtn">添加</el-button>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="uid" label="用户编号" width="300">
      </el-table-column>
      <el-table-column prop="rolename" label="角色" width="180">
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="180">
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
          <el-button size="mini" @click="editUser(scope.row.uid)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="delUser(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对话框 -->
    <el-dialog
      @open="openFn"
      @close="closeFn"
      :title="info.isAdd ? '新增管理员' : '编辑管理员'"
      :visible.sync="info.isShow"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="ruleForm">
        <el-form-item label="角色">
          <el-select v-model="form.roleid">
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in roles"
              :key="index"
              :label="item.rolename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="form.password" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="info.isShow = false">取 消</el-button>
        <el-button type="primary" @click="submitFn">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分页器 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="pageCount"
      :page-size="size"
      :current-page.sync="page"
      @current-change="pageChange"
    >
    </el-pagination>
  </div>
</template>

<script>
let defaultForm = {
  password: "",
  roleid: "",
  status: true,
  username: "",
};
export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      tableData: [],
      roles: [],
      pageCount: 0,
      page: 1,
      size: 2,
      info: {
        isShow: false,
        isAdd: true,
      },
      form: { ...defaultForm },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
      },
    };
  },

  methods: {
    // 方法一 // 方法二用axios并发
    async getTData() {
      let res = await this.$http.get("/api/userlist", {
        page: this.page,
        size: this.size,
      });
      // 获取用户数量，方便分页
      let pageCount = await this.$http.get("/api/usercount");
      if (res.code == 200 && pageCount.code == 200) {
        this.tableData = res.list ? res.list : [];
        // console.log(pageCount.list[0].total);
        this.pageCount = pageCount.list ? pageCount.list[0].total : 0;
      } else {
        this.$message.error(res.msg);
        this.$message.error(pageCount.msg);
      }
    },

    async getRoles() {
      let res = await this.$http.get("/api/rolelist");
      if (res.code == 200) {
        this.roles = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },

    // 页面切换
    pageChange(cur) {
      // console.log(cur);
      // 根据当前页数重新请求数据并渲染页面
      this.page = cur;
      this.getTData();
    },

    addUser() {
      this.info = {
        isShow: true,
        isAdd: true,
      };
    },
    openFn() {
      this.getRoles();
    },
    closeFn() {
      this.form = { ...defaultForm };
    },
    submitFn() {
      this.$refs.ruleForm.validate(async (value) => {
        let url = this.info.isAdd ? "/api/useradd" : "/api/useredit";
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
    async editUser(uid) {
      this.info = {
        isShow: true,
        isAdd: false,
      };
      let res = await this.$http.get("/api/userinfo", { uid });
      // console.log(res);
      if (res.code == 200) {
        let {uid,username,roleid} = res.list;
        // 密码不用传，由于是暗码，容易误改
        // 可以直接修改密码，提交空字符串就是不修改
        this.form = {
          uid,
          username,
          roleid,
          status: res.list.status === 1 ? true : false,
        };
      } else {
        this.$message.error(res.msg);
      }
    },
    delUser(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await this.$http.post("/api/userdelete", { id });
          if (res.code == 200) {
            // 删除成功退回第一页
            this.pageChange(1);
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