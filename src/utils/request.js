import axios from "axios";
import { getToken } from "./cookie";

// 使用 axios 的 create 方法创建一个 axios 实例
// baseURL: 发起请求时的公共前缀
// timeout: 发起请求时的超时时间, 如果规定时间内没有收到响应, 就会中断请求并返回超时错误, 作用是提高用户体验
const service = axios.create({
  baseURL: "/dev-api",
  timeout: 5000
});

// 响应拦截器, 负责在响应到达前端处理逻辑之前, 根据响应的正常与否分别进行处理
service.interceptors.response.use(
  // 响应的 Http 状态码为成功时的回调函数
  // res: 响应对象
  (res) => {
    const code = res.data.code;
    const msg = res.data.msg;
    if (code === 1000) {
      // 由于响应中包含的内容很多, 例如响应的 Http 状态码、headers 等, 但是我们需要的响应数据是在其 data 部分
      // 因此此处做了拆包, 只将响应的 data 部分返回给下层
      return Promise.resolve(res.data);
    } else {
      ElMessage.error(msg);
      // reject 就相当于 Java 中抛出异常
      return Promise.reject(new Error(msg));
    }
  },
  // 响应的 Http 状态码为失败时的回调函数
  (error) => {
    // reject 就相当于 Java 中抛出异常
    new Promise.reject(error);
  }
);

// 请求拦截器, 负责在前端请求发出之前, 统一在请求头中加上 token
service.interceptors.request.use(
  // config: 请求对象
  (config) => {
    if (getToken()) {
      config.headers["Authorization"] = "Bearer " + getToken();
    }
    return config;
  },
  (error) => {
    console.log(error);
    Promise.reject(error);
  }
)

// 将 service 暴露给其他模块可供进行导入
export default service
