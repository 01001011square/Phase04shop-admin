<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>轮播图列表</el-breadcrumb-item>
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
      <el-table-column prop="title" label="轮播图名称" width="180">
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
      :title="info.isAdd ? '新增轮播图' : '编辑轮播图'"
      :visible.sync="info.isShow"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="ruleForm">
        <el-form-item label="轮播图名称" prop="title">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类图片">
          <!-- element-ui图片上传 -->
          <!-- :on-preview="handlePreview" -->
          <el-upload
            ref="file"
            action="#"
            list-type="picture-card"
            :file-list="info.fileList"
            :auto-upload="false"
            :on-change="whileUpload"
            :on-preview="handlePreview"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <!-- 上传图片预览对话框 -->
          <el-dialog :visible.sync="flag" append-to-body>
            <img width="100%" :src="info.dialogImageUrl" alt="" />
          </el-dialog>
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
  title: "",
  img: "",
  status: true,
};
export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      flag: false,
      tableData: [],
      info: {
        isShow: false,
        isAdd: true,
        fileList: [],
        dialogImageUrl: "",
      },
      form: { ...defaultForm },
      rules: {
        title: [
          { required: true, message: "请输入轮播图名称", trigger: "blur" },
        ],
      },
    };
  },

  methods: {
    async getTData() {
      let res = await this.$http.get("/api/bannerlist");
      // console.log(res);
      if (res.code == 200) {
        this.tableData = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },

    // 点击上传图片后将图片数据存入form准备上传
    whileUpload(file, fileList) {
      this.form.img = file.raw;
      this.info.dialogImageUrl = file.url;
    },
    // 点击预览图片弹出预览对话框
    handlePreview() {
      this.flag = true;
    },

    addFn() {
      this.info = {
        isShow: true,
        isAdd: true,
      };
    },
    // openFn() {},
    closeFn() {
      this.form = { ...defaultForm };
      this.flag = false;
      this.info.dialogImageUrl = "";
      this.$refs.file.clearFiles();
    },
    async editFn(id) {
      this.info = {
        isShow: true,
        isAdd: false,
      };
      let res = await this.$http.get("/api/bannerinfo", { id });
      if (res.code == 200) {
        this.form = {
          id,
          ...res.list,
          status: res.list.status === 1 ? true : false,
        };
        // 设置上传文件列表(编辑时显示预览图)
        // res.list.img是后台服务器的相对地址，需要拼接转换为绝对地址
        this.info.fileList = [{ name: "", url: this.$domain + res.list.img }];
      } else {
        this.$message.error(res.msg);
      }
    },
    delFn(id) {
      this.$confirm("此操作将永久删除该轮播图, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await this.$http.post("/api/bannerdelete", { id });
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
        let url = this.info.isAdd ? "/api/banneradd" : "/api/banneredit";
        this.form.status = this.form.status ? 1 : 2;
        let res = await this.$http.upload(url, this.form);
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