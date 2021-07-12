import Vue from 'vue'
import Router from 'vue-router'
import { Message } from 'element-ui'

const layout = () => import('@/views/layout')
const login = () => import('@/views/login')

// 二级路由
const index = () => import('@/views/layout/index')
const menu = () => import('@/views/layout/menu')
const role = () => import('@/views/layout/role')
const user = () => import('@/views/layout/user')
const category = () => import('@/views/layout/category')
const specs = () => import('@/views/layout/specs')
const goods = () => import('@/views/layout/goods')
const member = () => import('@/views/layout/member')
const banner = () => import('@/views/layout/banner')
const seckill = () => import('@/views/layout/seckill')

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/index'
    },
    {
      path: '/login',
      component: login
    },
    {
      path: '/',
      component: layout,
      children: [
        {
          path: '/',
          redirect: '/index'
        },
        {
          path: 'index',
          component: index
        },
        {
          path: 'menu',
          component: menu
        },
        {
          path: 'role',
          component: role
        },
        {
          path: 'user',
          component: user
        },
        {
          path: 'category',
          component: category
        },
        {
          path: 'specs',
          component: specs
        },
        {
          path: 'goods',
          component: goods
        },
        {
          path: 'member',
          component: member
        },
        {
          path: 'banner',
          component: banner
        },
        {
          path: 'seckill',
          component: seckill
        }

      ]

    }
  ]
})


// 全局导航守卫，不登录无法访问
router.beforeEach((to, from, next) => {
  if (localStorage.getItem('userinfo')) {
    if (to.path == '/login') {
      next(false)
    } else {
      // 获取访问者的权限地址
      let urls = JSON.parse(localStorage.getItem("userinfo")).menus_url.concat("/", "/index");
      // 判断权限地址和路由地址是否匹配
      let flag = urls.find(item => item == to.path);
      if (flag) {
        next()
      } else {
        Message.error("权限不足")
        next(false);
      }
    }
  } else {
    // 注意不能直接给next('/login')，会触发死循环
    if (to.path == '/login') {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
