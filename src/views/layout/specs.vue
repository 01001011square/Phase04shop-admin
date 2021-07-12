<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品规格</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary" @click="addFn()" class="addBtn">添加</el-button>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="specsname" label="属性名称" width="180">
      </el-table-column>
      <el-table-column label="属性值" width="300">
        <template slot-scope="scope">
          <el-tag v-for="(item, index) in scope.row.attrs" :key="index">{{
            item
          }}</el-tag>
        </template>
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
          <el-button size="mini" @click="editFn(scope.row.id)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="delFn(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 对话框 -->
    <el-dialog
      @close="closeFn"
      :title="info.isAdd ? '新增规格' : '编辑规格'"
      :visible.sync="info.isShow"
    >
      <el-form label-width="80px" :model="form" ref="ruleForm" :rules="rules">
        <el-form-item label="属性名称" prop="specsname">
          <el-input autocomplete="off" v-model="form.specsname"></el-input>
        </el-form-item>
        <el-form-item label="属性值">
          <div v-for="(item, index) in attrList" :key="index">
            <el-input
              autocomplete="off"
              v-model="item.value"
              style="width: 50%; margin-bottom: 5px"
            ></el-input>
            <el-button type="primary" v-if="index === 0" @click="addAttr">
              新增属性值
            </el-button>
            <el-button type="danger" v-else @click="delAttr(index)">
              删除属性值
            </el-button>
          </div>
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
  specsname: "",
  attrs: "",
  status: true,
};

export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      tableData: [],
      // 注意v-model不能直接绑定数组成员(没有getter和setter)，可以绑定成员的属性值
      attrList: [{ value: "" }],
      info: {
        isShow: false,
        isAdd: true,
      },
      form: { ...defaultForm },
      rules: {
        specsname: [
          { required: true, message: "请输入属性名称", trigger: "blur" },
        ],
      },
    };
  },

  methods: {
    async getTData() {
      let res = await this.$http.get("/api/specslist");
      // console.log(res);
      if (res.code == 200) {
        this.tableData = res.list;
      } else {
        this.$message.error(res.msg);
      }
    },

    addFn() {
      this.info = {
        isShow: true,
        isAdd: true,
      };
    },
    closeFn() {
      this.form = { ...defaultForm };
      this.attrList = [{ value: "" }]
    },
    async editFn(id) {
      this.info = {
        isShow: true,
        isAdd: false,
      };
      let res = await this.$http.get("/api/specsinfo", { id });
      if (res.code == 200) {
        this.form.specsname = res.list[0].specsname;
        this.form.id = res.list[0].id;
        this.form.status = res.list[0].status === 1 ? true : false;
        // 将数据转换后存入attrList
        this.attrList = res.list[0].attrs.map((item) => ({ value: item }));
        // console.log(this.attrList);
      } else {
        this.$message.error(res.msg);
      }
    },
    delFn(id) {
      this.$confirm("此操作将永久删除该属性, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await this.$http.post("/api/specsdelete", { id });
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
    submitFn() {
      this.$refs.ruleForm.validate(async (value) => {
        let url = this.info.isAdd ? "/api/specsadd" : "/api/specsedit";
        // 数据转换，接口要求attrs为字符串
        this.form.attrs = this.attrList.map((item) => item.value).join(",");

        this.form.status = this.form.status ? 1 : 2;
        // console.log(this.form);
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

    // 对话框添加属性值
    addAttr() {
      this.attrList.push({ value: "" });
    },
    // 对话框删除属性值
    delAttr(index) {
      this.attrList.splice(index, 1);
    },
  },
};
</script>