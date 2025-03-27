<template>
  <el-container class="layout-container">
    <el-header class="el-header">
      <el-dropdown>
        <span class="el-dropdown__box">
          <div>
            <strong>当前用户：</strong>{{ loginUser.nickName }}
          </div>
          <el-icon>
            <ArrowDownBold />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>
    <el-main class="layout-bottom-box">
      <div class="left">
        <el-aside width="200px" class="el-aside">
          <el-menu class="el-menu" router>
            <el-menu-item index="/oj/system/cuser">
              <el-icon>
                <User />
              </el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/oj/system/question">
              <el-icon>
                <EditPen />
              </el-icon>
              <span>题目管理</span>
            </el-menu-item>
            <el-menu-item index="/oj/system/exam">
              <el-icon>
                <Medal />
              </el-icon>
              <span>竞赛管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
      </div>
      <div class="right">
        <RouterView />
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import {
  User,
  EditPen,
  Medal,
  ArrowDownBold,
  SwitchButton
} from '@element-plus/icons-vue'
import { getUserInfoService, logoutService } from '@/apis/suser'
import { reactive } from 'vue'
import { removeToken } from '@/utils/cookie'
import router from '@/router'

// 使用响应式数据, 实时获取到数据
const loginUser = reactive({
  nickName: ""
})

async function getUserInfo() {
  const userInfo = await getUserInfoService()
  loginUser.nickName = userInfo.data.nickName
}
// 需要一进入页面就发起请求, 因此需要在此处直接调用
getUserInfo()

async function logout() {
  // ElMessageBox.confirm 返回的也是一个 Promise 对象, 因此也是一个异步操作
  // 但是此处需要的是点击确认退出之后再发起 "退出登录" 的请求, 也即是需要同步等待点击了"确认退出"
  // 因此需要使用 await 等待异步操作的结果再进行下一步, 相当于将异步操作转化为同步的效果
  await ElMessageBox.confirm(
    '确认退出?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )

  // 同样需要等待 "退出登录" 请求结果返回后再进行下一步
  // 并且由于此处如果响应结果是失败的情况, 也无需进行额外操作
  // 因此只需响应拦截器处将错误信息提示给用户即可, 此处无需使用 try catch 捕获异常后进行额外处理
  await logoutService()
  
  // 退出登录成功之后:
  // 1) 将 token 进行删除
  removeToken()
  // 2) 返回到登录页面
  router.push("/oj/login")
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  background: linear-gradient(150deg, #f0f9ff 0%, #e6f4ff 100%);

  .layout-bottom-box {
    display: flex;
    justify-content: space-between;
    height: calc(100vh - 100px);
    overflow: hidden;

    .left {
      margin-right: 20px;
      background: #fff;
      display: flex;

      :deep(.el-menu) {
        flex: 1;

        .el-menu-item.is-active {
          color: #32c5ff;
        }

        .el-menu-item:hover {
          background: #fff;
          color: #32c5ff;
        }
      }
    }

    .right {
      flex: 1;
      overflow-y: auto;
      background: #fff;
      padding: 20px;
    }
  }

  .el-aside {
    background-color: #fff;

    &__logo {
      height: 120px;
      // background: url('@/assets/logo.png') no-repeat center / 120px auto;
    }

    .el-menu {
      border-right: none;
    }
  }

  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 40px;

    .el-dropdown__box {
      display: flex;
      align-items: center;

      .el-icon {
        color: #4c4141;
        margin-left: 20px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
}
</style>