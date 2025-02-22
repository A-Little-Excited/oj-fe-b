import service from "@/utils/request";

export function loginService(userAccount, password) {
  service({
    url: "/sysUser/login",
    method: "post",
    data: {userAccount, password}
  })
}