<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>秒杀活动</el-breadcrumb-item>
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
      <el-table-column prop="title" label="活动名称" width="180">
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
      @open="openFn"
      @close="closeFn"
      :title="info.isAdd ? '新增活动' : '编辑活动'"
      :visible.sync="info.isShow"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="ruleForm">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动期限">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="一级分类">
          <el-select v-model="form.first_cateid" @change="firstChange">
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in firstCateLi"
              :key="index"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="form.second_cateid" @change="secChange">
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in secCateLi"
              :key="index"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品">
          <el-select v-model="form.goodsid">
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in goodsLi"
              :key="index"
              :label="item.goodsname"
              :value="item.id"
            ></el-option>
          </el-select>
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
  begintime: "", // string
  endtime: "", // string
  first_cateid: "",
  second_cateid: "",
  goodsid: "",
  status: true,
};

export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      dateRange: "",
      tableData: [],
      firstCateLi: [],
      secCateLi: [],
      fid: "",
      goodsLi: [],
      info: {
        isShow: false,
        isAdd: true,
      },
      form: { ...defaultForm },
      rules: {
        title: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
      },
    };
  },

  methods: {
    async getTData() {
      let res = await this.$http.get("/api/secklist");
      // console.log(res);
      if (res.code == 200) {
        this.tableData = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },

    // 获取分类列表
    async getCateLi(pid = 0) {
      let res = await this.$http.get("/api/catelist", { pid });
      if (pid == 0) {
        if (res.code == 200) {
          this.firstCateLi = res.list ? res.list : [];
        } else {
          this.$message.error(res.msg);
        }
      } else {
        if (res.code == 200) {
          this.secCateLi = res.list ? res.list : [];
        } else {
          this.$message.error(res.msg);
        }
      }
    },
    // 一级分类列表选中后获取对应的二级分类列表
    firstChange(fid) {
      this.secCateLi = [];
      this.form.second_cateid = "";
      this.goodsLi = [];
      this.form.goodsid = "";
      this.getCateLi(fid);
      this.fid = fid;
    },
    // 二级分类列表选中后获取对应的商品列表
    async secChange(sid) {
      this.goodsLi = [];
      this.form.goodsid = "";
      let res = await this.$http.get("/api/goodslist", {
        fid: this.fid,
        sid: sid,
      });
      // console.log(res);
      if (res.code == 200) {
        this.goodsLi = res.list ? res.list : [];
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
    openFn() {
      this.getCateLi();
    },
    closeFn() {
      this.form = { ...defaultForm };
      this.dateRange = "";
      this.firstCateLi = [];
      this.secCateLi = [];
      this.fid = "";
      this.goodsLi = [];
    },
    async editFn(id) {
      this.info = {
        isShow: true,
        isAdd: false,
      };
      let res = await this.$http.get("/api/seckinfo", { id });
      // console.log(res);
      if (res.code == 200) {
        this.form = {
          id,
          ...res.list,
          status: res.list.status === 1 ? true : false,
        };
        // 渲染时间
        this.dateRange = [
          this.$time.stamp2Read(res.list.begintime),
          this.$time.stamp2Read(res.list.endtime),
        ];
        // 渲染二级分类
        this.getCateLi(res.list.first_cateid);
        // 渲染商品
        let goods = await this.$http.get("/api/goodslist", {
          fid: res.list.first_cateid,
          sid: res.list.second_cateid,
        });
        this.goodsLi = goods.list;
      } else {
        this.$message.error(res.msg);
      }
    },

    delFn(id) {
      this.$confirm("此操作将永久删除该活动, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await this.$http.post("/api/seckdelete", { id });
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
        let url = this.info.isAdd ? "/api/seckadd" : "/api/seckedit";
        // 将时间转换为字符串时间戳
        this.form.begintime = this.$time.read2Stamp(this.dateRange[0]) + "";
        this.form.endtime = this.$time.read2Stamp(this.dateRange[1]) + "";
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
  },
};
</script>