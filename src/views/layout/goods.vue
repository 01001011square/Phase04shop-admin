<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
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
      <el-table-column prop="firstcatename" label="一级分类" width="150">
      </el-table-column>
      <el-table-column prop="secondcatename" label="二级分类" width="150">
      </el-table-column>
      <el-table-column prop="goodsname" label="商品名称" width="200">
      </el-table-column>
      <el-table-column prop="price" label="销售价" width="100">
      </el-table-column>
      <el-table-column prop="market_price" label="市场价" width="100">
      </el-table-column>
      <el-table-column label="状态" width="120">
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
      @opened="openedFn"
      @close="closeFn"
      :title="info.isAdd ? '新增商品' : '编辑商品'"
      :visible.sync="info.isShow"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="ruleForm">
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
          <el-select v-model="form.second_cateid">
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in secCateLi"
              :key="index"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="form.goodsname" autocomplete="off"></el-input>
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
        <el-form-item label="销售价">
          <el-input
            v-model="form.price"
            autocomplete="off"
            type="number"
          ></el-input>
        </el-form-item>
        <el-form-item label="市场价">
          <el-input
            v-model="form.market_price"
            autocomplete="off"
            type="number"
          ></el-input>
        </el-form-item>

        <el-form-item label="商品属性">
          <el-select v-model="form.specsid" @change="specsChange">
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in specsLi"
              :key="index"
              :label="item.specsname"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="属性值">
          <el-select v-model="form.specsattr" multiple>
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in specsAttrLi"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="是否新品">
          <el-radio v-model="form.isnew" :label="1">是</el-radio>
          <el-radio v-model="form.isnew" :label="2">否</el-radio>
        </el-form-item>
        <el-form-item label="是否热卖">
          <el-radio v-model="form.ishot" :label="1">是</el-radio>
          <el-radio v-model="form.ishot" :label="2">否</el-radio>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio v-model="form.status" :label="1">上架</el-radio>
          <el-radio v-model="form.status" :label="2">下架</el-radio>
        </el-form-item>
        <el-form-item label="商品描述">
          <div id="desc"></div>
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
// 重点：
// 1. 一二级分类联动
// 2. 分页效果
// 3. 富文本框

import axios from "axios";
import E from "wangeditor";

let defaultForm = {
  first_cateid: "",
  second_cateid: "",
  goodsname: "",
  price: "",
  market_price: "",
  img: "",
  description: "",
  specsid: "",
  specsattr: "",
  isnew: 1,
  ishot: 1,
  status: 1,
};

export default {
  created() {
    this.getTData();
  },
  data() {
    return {
      // 放在data中方便拿到富文本框的数据
      editor: "",

      flag: false,
      tableData: [],
      pageCount: 0,
      page: 1,
      size: 2,
      firstCateLi: [],
      secCateLi: [],
      specsLi: [],
      specsAttrLi: [],
      info: {
        isShow: false,
        isAdd: true,
        fileList: [],
        dialogImageUrl: "",
      },
      form: { ...defaultForm },
      rules: {},
    };
  },

  methods: {
    getList() {
      return this.$http.get("/api/goodslist", {
        page: this.page,
        size: this.size,
      });
    },
    getPageCount() {
      return this.$http.get("/api/goodscount");
    },
    // axios并发请求
    getTData() {
      axios.all([this.getList(), this.getPageCount()]).then(
        axios.spread((tableData, pageCount) => {
          if (tableData.code == 200 && pageCount.code == 200) {
            this.tableData = tableData.list ? tableData.list : [];
            this.pageCount = pageCount.list ? pageCount.list[0].total : 0;
          } else {
            this.$message.error(tableData.msg);
            this.$message.error(pageCount.msg);
          }
        })
      );
    },

    // 页面切换
    pageChange(cur) {
      // console.log(cur);
      // 根据当前页数重新请求数据并渲染页面
      this.page = cur;
      this.getTData();
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
    firstChange(id) {
      this.getCateLi(id);
      this.secCateLi = [];
      this.form.second_cateid = "";
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

    // 获取属性列表
    async getSpecsLi() {
      let res = await this.$http.get("/api/specslist");
      if (res.code == 200) {
        this.specsLi = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },

    // 获取属性列表后获取对应的属性值
    specsChange(id) {
      let item = this.specsLi.find((item) => item.id === id);
      this.specsAttrLi = item.attrs;
    },

    addFn() {
      this.info = {
        isShow: true,
        isAdd: true,
      };
    },
    openFn() {
      this.getCateLi();
      this.getSpecsLi();
    },
    openedFn() {
      this.editor = new E("#desc");
      this.editor.create();
      // 渲染富文本框是异步操作，可以先在打开时渲染好，之后再次渲染以免报错
      this.editor.txt.html(this.form.description);
    },
    closeFn() {
      // 每次关闭后清空富文本框以免每次打开会出现嵌套富文本框
      document.getElementById("desc").innerHTML = "";

      this.form = { ...defaultForm };
      this.flag = false;
      this.info.dialogImageUrl = "";
      this.$refs.file.clearFiles();
      
      this.firstCateLi = [];
      this.secCateLi = [];
      this.specsLi = [];
      this.specsAttrLi = [];
    },
    submitFn() {
      // 获取富文本框内容
      console.log(this.editor.txt.html());

      this.$refs.ruleForm.validate(async (value) => {
        let url = this.info.isAdd ? "/api/goodsadd" : "/api/goodsedit";
        // 将时间转换为字符串时间戳

        this.form.description = this.editor.txt.html();
        this.form.specsattr = this.form.specsattr.join(",");
        let res = await this.$http.upload(url, this.form);
        // console.log(this.form);
        if (res.code == 200) {
          this.getTData();
          this.$message.success(res.msg);
        } else {
          this.$message.error(res.msg);
        }
        this.info.isShow = false;
      });
    },
    async editFn(id) {
      this.info = {
        isShow: true,
        isAdd: false,
      };
      let res = await this.$http.get("/api/goodsinfo", { id });
      // console.log(res);
      if (res.code == 200) {
        this.form = {
          id,
          ...res.list,
        };
        // 设置上传文件列表(编辑时显示预览图)
        // res.list.img是后台服务器的相对地址，需要拼接转换为绝对地址
        this.info.fileList = [{ name: "", url: this.$domain + res.list.img }];
        // 通过一级分类id渲染二级分类
        this.getCateLi(res.list.first_cateid);
        // 重新获取一遍属性id，再渲染属性值
        let specs = await this.$http.get("/api/specslist");
        if (res.code == 200) {
          this.specsLi = specs.list ? specs.list : [];
        }
        this.form.specsattr = [...res.list.specsattr.split(",")];
        this.specsChange(res.list.specsid);

        // 渲染富文本框
        if (this.form.description) {
          this.editor.txt.html(this.form.description);
        }
      } else {
        this.$message.error(res.msg);
      }
    },
    delFn(id) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          let res = await this.$http.post("/api/goodsdelete", { id });
          if (res.code == 200) {
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