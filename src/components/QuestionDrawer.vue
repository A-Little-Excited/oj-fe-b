<template>
  <el-drawer v-model="visibleDrawer" :destroy-on-close="true" :with-header="false" size="50%">
    <el-form :model="formModel" ref="formRef">
      <el-form-item label="题目标题:">
        <el-input style="width:387px !important" v-model="formQuestion.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="题目难度:">
        <QuestionSelector style="width:387px !important" v-model="formQuestion.difficulty" width="100%" placeholder="请选择题目难度">
        </QuestionSelector>
      </el-form-item>
      <el-form-item label="时间限制（单位毫秒）:">
        <el-input style="width:300px !important" v-model="formQuestion.timeLimit" placeholder="请输入时间限制"></el-input>
      </el-form-item>
      <el-form-item label="空间限制（单位字节）:">
        <el-input style="width:300px !important" v-model="formQuestion.spaceLimit" placeholder="请输入空间限制"></el-input>
      </el-form-item>
      <el-form-item label="题目内容:">
        <div class="editor">
          <quill-editor placeholder="请输入题目内容" v-model:content="formQuestion.content" content-type="html"></quill-editor>
        </div>
      </el-form-item>
      <el-form-item label="题目用例:">
        <el-input style="width:387px !important" v-model="formQuestion.questionCase" placeholder="请输入题目用例"></el-input>
      </el-form-item>
      <el-form-item label="默认代码块:">
        <!-- 监听 update:value 事件, 并配置 handleEditorDefaultCode 为事件处理器 -->
        <code-editor @update:value="handleEditorDefaultCode" ref="defaultCodeRef"></code-editor>
      </el-form-item>
      <el-form-item label="main函数:">
        <!-- 监听 update:value 事件, 并配置 handleEditorMainFunc 为事件处理器 -->
        <code-editor @update:value="handleEditorMainFunc" ref="mainFuncRef"></code-editor>
      </el-form-item>
      <el-form-item>
        <el-button class="question-button" type="primary" plain @click="onSubmit()">发布</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import CodeEditor from './CodeEditor.vue';
import { reactive, ref } from 'vue';
import QuestionSelector from './QuestionSelector.vue';
import { addQuestionService, editQuestionService, getQuestionDetailService } from '@/apis/question';

// 是否展示抽屉
const visibleDrawer = ref(false)
// 添加题目的信息
const formQuestion = reactive({
  // questionId 在编辑题目时需要向后端传递
  questionId: '',
  title: '',
  difficulty: '',
  content: '',
  questionCase: '',
  timeLimit: '',
  spaceLimit: '',
  defaultCode: '',
  mainFunc: ''
})

const defaultCodeRef = ref()
const mainFuncRef = ref()

async function open(questionId) {
  // 将抽屉打开
  visibleDrawer.value = true;
  // 将变量值置为空, 以保证抽屉中对应的选项被重置
  for (const key in formQuestion) {
    if (formQuestion.hasOwnProperty(key)) {
      formQuestion[key] = '';
    }
  }

  // 如果 questionId 为空, 那么是添加题目, 不需要处理
  // 如果 questionId 不为空, 那么是编辑题目, 拉开抽屉的同时需要获取题目详情进行展示
  if (questionId) {
    const questionDetail = await getQuestionDetailService(questionId);
    // 将 questionDetail.data 赋值给 formQuestion
    // 由于 v-model 进行了双向绑定, 因此变量值改变就会引起抽屉中对应的选项的改变
    Object.assign(formQuestion, questionDetail.data)
    
    // 通过子组件实例调用方法将数据传递给子组件(编辑器)
    defaultCodeRef.value.setAceCode(formQuestion.defaultCode)
    mainFuncRef.value.setAceCode(formQuestion.mainFunc)
  }
}
// 暴露 open 方法可供父组件进行调用
defineExpose({
  open
})

// 校验添加题目时是否有参数为空
function validate() {
  let msg = ''
  if (!formQuestion.title) {
    msg = '请添加题目标题'
  } else if (formQuestion.difficulty == '') {
    msg = '请选择题目难度'
  } else if (!formQuestion.timeLimit) {
    msg = '请输入时间限制'
  } else if (!formQuestion.spaceLimit) {
    msg = '请输入空间限制'
  } else if (!formQuestion.content) {
    msg = '请输入题目内容'
  } else if (!formQuestion.questionCase) {
    msg = '请输入题目用例'
  } else if (!formQuestion.defaultCode) {
    msg = '请输入默认代码'
  } else if (!formQuestion.mainFunc) {
    msg = '请输入main函数'
  } else {
    msg = ''
  }
  return msg
}

// 自定义事件, 用于通知父组件 "添加题目成功"
const emit = defineEmits(['success'])

// 发起添加/编辑题目请求
async function onSubmit() {
  await ElMessageBox.confirm(
    '确认发布?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )

  const errorMessage = validate()
  if (errorMessage) {
    ElMessage.error(errorMessage);
    return false
  }

  // 由于是表单数据, 因此需要将数据放在 FormdData 当中
  const fd = new FormData()
  for (let key in formQuestion) {
    fd.append(key, formQuestion[key])
  }

  if (formQuestion.questionId) {
    // 编辑题目之前, 会先获取题目详情, 因此 formQuestion 是有值的, 并且 questionId 是有值得
    // 因此 questionId 不为空, 说明是编辑题目
    await editQuestionService(fd)
    ElMessage.success('编辑成功')

    // 当题目编辑成功时触发自定义事件
    emit('success', 'edit')
  } else {
    // 添加题目时, formQuestion 也是获取到了用户填的数据, 因此也是有值的
    // 但是由于没有可以填取 questionId 的选项, 因此 questionId 是没有值的
    // 因此 questionId 为空, 说明是添加题目

    // 如果能够正常接收到响应, 说明已经添加成功
    // 如果添加失败, 响应拦截器会先行拦截并抛出异常
    await addQuestionService(fd)
    ElMessage.success('添加成功')

    // 当题目添加成功时触发自定义事件
    emit('success', 'add')
  }

  // 添加/编辑成功后需要将抽屉收回
  visibleDrawer.value = false
}

function handleEditorDefaultCode(defaultCode) {
  formQuestion.defaultCode = defaultCode
}
function handleEditorMainFunc(mainFunc) {
  formQuestion.mainFunc = mainFunc
}

</script>

<style lang="scss">
.question-button {
  width: 200px;
}
</style>
