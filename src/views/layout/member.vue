<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>会员列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%; margin-top: 20px"
      row-key="id"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="nickname" label="昵称" width="180">
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="180">
      </el-table-column>
      <el-table-column prop="addtime" label="注册日期" width="180">
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
          <el-button size="mini" @click="editFn(scope.row.uid)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对话框 -->
    <el-dialog @close="closeFn" title="编辑会员" :visible.sync="info.isShow">
      <el-form label-width="80px" :model="form" ref="ruleForm">
        <el-form-item label="昵称">
          <el-input autocomplete="off" v-model="form.nickname" disabled>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input autocomplete="off" v-model="form.phone"> </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input autocomplete="off" v-model="form.password"> </el-input>
          <p>不填写则不修改密码</p>
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
  </div>
</template>

<script>
let defaultForm = {
  uid: "",
  nickname: "",
  phone: "",
  password: "",
  status: true,
};

export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      tableData: [],
      info: {
        isShow: false,
      },
      page: 1,
      size: 2,
      form: { ...defaultForm },
    };
  },

  methods: {
    async getTData() {
      let res = await this.$http.get("/api/memberlist", {
        size: this.size,
        page: this.page,
      });
      // console.log(res);
      if (res.code == 200) {
        this.tableData = res.list;
        for (const item of this.tableData) {
          item.addtime = this.$time.stamp2Read(item.addtime);
        }
      } else {
        this.$message.error(res.msg);
      }
    },

    closeFn() {
      this.form = { ...defaultForm };
    },
    async editFn(uid) {
      this.info.isShow = true;
      let res = await this.$http.get("/api/memberinfo", { uid });
      if (res.code == 200) {
        // console.log(res);
        let { uid, nickname, phone } = res.list;
        this.form = {
          uid,
          nickname,
          phone,
          status: res.list.status === 1 ? true : false,
        };
      } else {
        this.$message.error(res.msg);
      }
    },
    submitFn() {
      this.$refs.ruleForm.validate(async (value) => {
        this.form.status = this.form.status ? 1 : 2;
        let res = await this.$http.post("/api/memberedit", this.form);
        if (res.code == 200) {
          this.getTData();
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
        this.info.isShow = false;
      });
    },
  },
};
</script>

