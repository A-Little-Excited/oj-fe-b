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
          <quill-editor placeholder="请输入题目内容" v-model:content="formQuestion.content"></quill-editor>
        </div>
      </el-form-item>
      <el-form-item label="题目用例:">
        <el-input style="width:387px !important" v-model="formQuestion.questionCase" placeholder="请输入题目用例"></el-input>
      </el-form-item>
      <el-form-item label="默认代码块:">
        <!-- 监听 update:value 事件, 并配置 handleEditorDefaultCode 为事件处理器 -->
        <code-editor @update:value="handleEditorDefaultCode"></code-editor>
      </el-form-item>
      <el-form-item label="main函数:">
        <!-- 监听 update:value 事件, 并配置 handleEditorMainFunc 为事件处理器 -->
        <code-editor @update:value="handleEditorMainFunc"></code-editor>
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
import { addQuestionService } from '@/apis/question';

const visibleDrawer = ref(false)
const formQuestion = reactive({
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

function open() {
  visibleDrawer.value = true;
  for (const key in formQuestion) {
    if (formQuestion.hasOwnProperty(key)) {
      formQuestion[key] = '';
    }
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

// 发起添加题目请求
async function onSubmit() {
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
  // 如果能够正常接收到响应, 说明已经添加成功
  // 如果添加失败, 响应拦截器会先行拦截并抛出异常
  await addQuestionService(fd)
  ElMessage.success('添加成功')

  // 当题目添加成功时触发自定义事件
  emit('success')

  // 添加成功后需要将抽屉收回
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
