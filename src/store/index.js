import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from '@/router'
import { Message } from 'element-ui'

Vue.use(Vuex)

let store = new Vuex.Store({
  state: {
    // 需要将接口获取的数据储存在localstorage里
    // 每次网页刷新vuex里的数据都会清空
    userinfo: localStorage.getItem('userinfo') ? JSON.parse(localStorage.getItem('userinfo')) : {}
  }, 
  // 计算属性，获取组件需要的数据
  getters: {
    // 用户名：header中需要
    username(state) {
      return state.userinfo.username
    },

    // 用户可访问菜单：导航栏中需要
    menus(state) {
      return state.userinfo.menus
    }
  },
  mutations: {
    // 在state中保存登录信息（登录时获取一次，之后都存在localstorage里）
    setinfo(state, info) {
      state.userinfo = info;
    },
    // 注销操作
    clearinfo(state) {
      localStorage.clear();
      state.userinfo = {};
      router.replace('/login')
    }
  },
  actions: {
    // context从接口获取的数据
    // formdata从组件获取的数据
    async login(context, formdata) {
      let res = await axios.post('/api/userlogin', formdata);
      // console.log(res.list);
      if (res.code == 200) {
        localStorage.setItem('userinfo', JSON.stringify(res.list))
        router.replace('/')
        // 将数据提交给mutation
        context.commit('setinfo', res.list)
      } else {
        Message({
          message: res.msg,
          type: 'error'
        })
      }
    }
  }
})

// 记得在入口文件导入
export default store