import axios from "axios"
import qs from "qs"
import store from "@/store"

// 请求拦截器
axios.interceptors.request.use(config => {
  // 判断是否登录，没有token为空
  let token = localStorage.getItem("userinfo") ? JSON.parse(localStorage.getItem("userinfo")).token : "";
  // 请求头中添加token
  config.headers["Authorization"] = token;
  return config
}, error => {
  return Promise.reject(error)
})


// 响应拦截器
axios.interceptors.response.use(res => {
  // 如果登录过期，进行登出操作
  if (res.data.code == 403) {
    store.commit("clearinfo")
  }
  return res.data  // 返回用户方便使用的数据
}, error => {
  return Promise.reject(error)
})

function get(url, params) {
  return new Promise((res, rej) => {
    axios({
      method: "GET",
      url,
      params,
    }).then(data => res(data))
      .catch(err => rej(err))
  })
}

function post(url, data = {}) {
  return new Promise((res, rej) => {
    axios({
      method: "POST",
      url,
      // qs插件进行加密并且变为一次请求
      data: qs.stringify(data),
    }).then(data => res(data))
      .catch(err => rej(err))
  })
}

function upload(url, data = {}) {
  return new Promise((res, rej) => {
    let formdata = new FormData();
    for (let key in data) {
      formdata.append(key, data[key]);
    }
    axios({
      method: "POST",
      url,
      data: formdata,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then(data => res(data))
      .catch(err => rej(err))
  })
}

export default {
  get,
  post,
  upload
}