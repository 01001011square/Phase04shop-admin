<template>
  <div class="login_bg">
    <div class="login_wrapper">
      <h3>登录</h3>
      <el-form label-width="0" :model="ruleForm" :rules="rules" ref="ruleForm">
        <el-form-item prop="username">
          <el-input
            placeholder="请输入用户名"
            v-model="ruleForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            v-model="ruleForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-button type="primary" @click="loginBtn()">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  data() {
    return {
      ruleForm: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 4, max: 6, message: "长度在 4 到 6 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            pattern: /^\d{4,6}$/,
            message: "长度为 4 到 6 个数字",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 引入vuex中的action
    ...mapActions(["login"]),
    /* login(formdata){
            this.$store.dispatch("login",formdata)
    }, */
    loginBtn() {
      // console.log(this.$refs); ref拿到的数据
      this.$refs.ruleForm.validate((value) => {
        // console.log(value); // boolean
        if (value) {
          // console.log(this.ruleForm);
          // 通过vuex中的action提交表单数据
          this.login(this.ruleForm);
        }
      });
    },
  },
};
</script>

<style lang="stylus">
.login_bg {
  height: 100%;
  background: -webkit-linear-gradient(left, #563443, #413a53, #2f3d60);

  .login_wrapper {
    height: 300px;
    width: 300px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h3 {
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: #ffffff;
      font-size: 30px;
      margin-bottom: 15px;
    }

    .el-button--primary {
      width: 100%;
    }
  }
}
</style>