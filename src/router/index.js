import { getToken } from '@/utils/cookie'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 访问项目初始地址, 直接重定向到登录页面
      path: "/",
      redirect: "/oj/login"
    },
    {
      path: '/oj/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/oj/system',
      name: 'system',
      component: () => import('@/views/System.vue'),
      children: [
        {
          path: 'question',
          name: 'question',
          component: () => import('@/views/Question.vue')
        },
        {
          path: 'exam',
          name: 'exam',
          component: () => import('@/views/Exam.vue')
        },
        {
          path: 'cuser',
          name: 'cuser',
          component: () => import('@/views/Cuser.vue')
        },
        {
          path: 'updateExam',
          name: 'updateExam',
          component: () => import('@/views/UpdateExam.vue')
        }
      ]
    }
  ]
})

// 注册一个全局前置守卫
// to: 下一个要访问的页面
// from: 从哪个页面来的
// next: 这是一个函数，表明了下一步要执行的逻辑
// 如果传入path参数，则下一步就是重定向到指定的页面，如果不传入参数则什么都不做，继续原有操作。
router.beforeEach((to, from, next) => {
  if (getToken()) {
    // 能够获取到 token, 说明用户处于登录状态
    if (to.path === '/oj/login') {
      // 已登录用户访问登录页面时自动跳转回后台管理页面
      next({ path: '/oj/system/cuser' })
    } else {
      next()
    }
  } else {
    // 没有获取到 token, 说明用户还未登录
    if (to.path !== '/oj/login') {
      // 未登录用户访问其他页面时自动跳转回登录页面
      ElMessage.error('请先进行登录');
      next({ path: '/oj/login' })
    } else {
      next()
    }
  }
})

export default router
