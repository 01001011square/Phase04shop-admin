<template>
  <div>

    <!-- open/close 对话框事件 -->
    <el-dialog
      @open="openFn"
      @close="resetDia"
      :title="info.isAdd ? '新增菜单' : '编辑菜单'"
      :visible.sync="info.isShow"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="ruleForm">
        <el-form-item label="目录名称">
          <!-- element-ui组件中的change事件 -->
          <el-select v-model="form.pid" @change="changeDir">
            <el-option label="顶级菜单" :value="0"></el-option>
            <!-- 动态生成option -->
            <el-option
              v-for="(item, index) in topDir"
              :key="index"
              :label="item.title"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="目录图标" v-if="form.type == 1" prop="icon">
          <el-input v-model="form.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="菜单地址" v-else prop="url">
          <el-input v-model="form.url" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio :disabled="form.type == 2" v-model="form.type" :label="1"
            >目录</el-radio
          >
          <el-radio :disabled="form.type == 1" v-model="form.type" :label="2"
            >菜单</el-radio
          >
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="info.isShow = false">取 消</el-button>
        <el-button type="primary" @click="submitMenu">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

let defaultForm = {
  pid: 0,
  title: "",
  icon: "",
  type: 1,
  url: "",
  status: true,
};

export default {
  data() {
    return {
      topDir: [],
      form: {
        ...defaultForm,
      },
      rules: {
        title: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
        icon: [{ required: true, message: "请输入菜单图标", trigger: "blur" }],
        url: [{ required: true, message: "请输入菜单URL", trigger: "blur" }],
      },
    };
  },
  props: ["info"],
  methods: {
    // 打开dialog时再请求数据，优化代码，减少请求
    openFn() {
      this.getTopDir();
    },
    // 获取顶级目录
    async getTopDir() {
      let res = await axios.get("/api/menulist", { params: { pid: 0 } });
      if (res.code == 200) {
        this.topDir = res.list ? res.list : [];
      } else {
        this.$message.error(res.msg);
      }
    },
    // 切换菜单时改变选单页面
    changeDir(id) {
      // console.log(id);
      this.form.type = id === 0 ? 1 : 2;
    },

    // 验证表单并提交数据
    submitMenu() {
      this.$refs.ruleForm.validate(async (value) => {
        if (value) {
          // 添加和修改的接口判断
          let url = this.info.isAdd ? "/api/menuadd" : "/api/menuedit";
          // 注意处理后台拉过来的数据的形式
          this.form.status = this.form.status ? 1 : 2;

          let res = await axios.post(url, this.form);
          if (res.code == 200) {
            // 成功后提醒父组件更新table数据
            this.$emit("getTData");
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }

          this.info.isShow = false
        }
      });
    },

    // 重置表单
    resetDia() {
      this.form = { ...defaultForm };
    },
  },
};
</script>