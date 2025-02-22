import axios from "axios"

// 使用 axios 的 create 方法创建一个 axios 实例
// baseURL: 发起请求时的公共前缀
// timeout: 发起请求时的超时时间, 如果规定时间内没有收到响应, 就会中断请求并返回超时错误, 作用是提高用户体验
const service = axios.create({
  baseURL: "127.0.0.1:19090/system",
  timeout: 5000
})

// 将 service 暴露给其他模块可供进行导入
export default service