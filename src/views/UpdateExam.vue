<template>
  <div class="add-exam-component-box">
    <div class="add-exam-component">
      <!-- 竞赛信息模块 -->
      <div class="exam-base-info-box">
        <!-- 标题 -->
        <div class="exam-base-title">
          <span class="base-title">{{ type === 'edit' ? '编辑竞赛' : '添加竞赛' }}</span>
          <span class="go-back" @click="goBack">返回</span>
        </div>
        <!-- 基本信息 -->
        <div class="exam-base-info">
          <div class="group-box">
            <div class="group-item">
              <div class="item-label required">竞赛名称</div>
              <div>
                <el-input v-model="formExam.title" style="width:420px" placeholder="请填写竞赛名称"></el-input>
              </div>
            </div>
          </div>
          <div class="group-box">
            <div class="group-item">
              <div class="item-label required">竞赛周期</div>
              <div>
                <el-date-picker v-model="formExam.examDate" :disabledDate="disabledDate" type="datetimerange"
                  start-placeholder="竞赛开始时间" end-placeholder="竞赛结束时间" value-format="YYYY-MM-DD HH:mm:ss" />
              </div>
            </div>
          </div>
          <div class="group-box">
            <div class="group-item">
              <el-button class="exam-base-info-button" type="primary" plain @click="saveBaseInfo">保存</el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 添加竞赛题目 -->
      <div class="exam-select-question-box">
        <el-button class="exam-add-question" :icon="Plus" type="text" @click="addExamQuestion()">
          添加竞赛题目
        </el-button>
        <el-table :data="formExam.examQuestionList" class="question-select-list">
          <el-table-column prop="questionId" width="180px" label="题目id" />
          <el-table-column prop="title" :show-overflow-tooltip="true" label="题目标题" />
          <el-table-column prop="difficulty" width="80px" label="题目难度">
            <template #default="{ row }">
              <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
              <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
              <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px">
            <template #default="{ row }">
              <el-button circle type="text" class="red" @click="deleteExamQuestion(formExam.examId, row.questionId)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 题目配置模块 题目列表勾选加序号 -->
      <div>
        <el-dialog v-model="dialogVisible">
          <div class="exam-list-box">
            <div class="exam-list-title required">选择竞赛题目</div>
            <el-form inline="true">
              <el-form-item label="题目难度">
                <selector v-model="params.difficulty" style="width: 120px;"></selector>
              </el-form-item>
              <el-form-item label="题目名称">
                <el-input v-model="params.title" placeholder="请您输入要搜索的题目标题" />
              </el-form-item>
              <el-form-item>
                <el-button @click="onSearch" plain>搜索</el-button>
                <el-button @click="onReset" plain type="info">重置</el-button>
              </el-form-item>

            </el-form>
            <!-- 题目列表 -->
            <el-table :data="questionList" @select="handleRowSelect">
              <el-table-column type="selection"></el-table-column>
              <el-table-column prop="questionId" label="题目id" />
              <el-table-column prop="title" label="题目标题" />
              <el-table-column prop="difficulty" label="题目难度">
                <template #default="{ row }">
                  <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
                  <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
                  <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <div class="exam-question-list-button">
              <el-pagination background size="small" layout="total, sizes, prev, pager, next, jumper" :total="totalData"
                v-model:current-page="params.pageNum" v-model:page-size="params.pageSize"
                :page-sizes="[1, 5, 10, 15, 20]" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
              <el-button class="question-select-submit" type="primary" plain
                @click="submitSelectQuestion">提交</el-button>
            </div>
          </div>
        </el-dialog>
      </div>

      <!-- 提交任务区域 -->
      <div class="submit-box absolute">
        <el-button type="info" plain @click="goBack">取消</el-button>
        <el-button type="primary" plain @click="publishExam">发布竞赛</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Selector from "@/components/QuestionSelector.vue"
import router from '@/router'
import { reactive, ref } from "vue"
import { Plus } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router';
import { addExamService, addExamQuestionService, getExamDetailService, editExamService, delExamQuestionService, publishExamService } from "@/apis/exam"
import { getQuestionListService } from "@/apis/question";

const type = useRoute().query.type
const formExam = reactive({
  examId: '',
  title: '',
  examDate: ''
})

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  title: '',
  excludeIdStr: ''
})

// 点击返回按钮
function goBack() {
  // 返回到上一级页面
  router.go(-1)
}

// 保存基本信息
async function saveBaseInfo() {
  const fd = new FormData()
  for (let key in formExam) {
    if (key === 'examDate') {
      fd.append('startTime', formExam.examDate[0]);
      fd.append('endTime', formExam.examDate[1]);
    } else if (key !== 'startTime' && key !== 'endTime') {
      // 由于获取竞赛详情时将 startTime 和 endTime 添加到了 formExam 中
      // 但是如果编辑竞赛是需要获取修改后的日期, 因此从 examDate 中获取参数进行添加即可
      // 不能再添加 startTime 和 endTime
      fd.append(key, formExam[key])
    }
  }
  if (formExam.examId) {
    await editExamService(fd)
  } else {
    const addResult = await addExamService(fd)
    // 将 formExam.examId 进行赋值, 后续添加竞赛题目的时候需要使用
    formExam.examId = addResult.data
  }
  ElMessage.success('竞赛基本信息保存成功')
}

const questionList = ref([])
const totalData = ref(0)
// 获取对话框所需要展示的题目列表
async function getQuestionList() {
  const result = await getQuestionListService(params)
  questionList.value = result.data
  totalData.value = result.total
}

// 待排除展示的题目 Id 集合
const excludeQuestionIdSet = ref([])
// 是否展示对话框
const dialogVisible = ref(false)
function addExamQuestion() {
  if (formExam.examId === null || formExam.examId === '') {
    ElMessage.error('请先保存竞赛基本信息')
  } else {
    // 将已经被选择的题目排除之后再进行题目列表展示
    console.log(excludeQuestionIdSet.value)
    const excludeQuestionIdStr = excludeQuestionIdSet.value.join(';');
    params.excludeIdStr = excludeQuestionIdStr

    getQuestionList()
    dialogVisible.value = true
  }
}

function handleSizeChange() {
  params.pageNum = 1
  getQuestionList()
}

function handleCurrentChange() {
  getQuestionList()
}


function onSearch() {
  params.pageNum = 1
  getQuestionList()
}

function onReset() {
  params.pageNum = 1
  params.pageSize = 10
  params.title = ''
  params.difficulty = ''
  getQuestionList()
}

async function publishExam() {
  await ElMessageBox.confirm(
    '确认发布?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  
  await publishExamService(formExam.examId);
  ElMessage.success('竞赛发布成功')
  router.push('/oj/system/exam')
}

const questionIdSet = ref([])

// 当某一题目对应的选择框被选中后, 就将该题目的 questionId 添加到数组中
function handleRowSelect(selection) {
  questionIdSet.value = []
  selection.forEach(element => {
    questionIdSet.value.push(element.questionId)
  });
}

async function submitSelectQuestion() {
  if (questionIdSet.value && questionIdSet.value.length < 1) {
    ElMessage.error('请先选择需要添加到竞赛中的题目')
    return false
  }
  const examQ = reactive({
    examId: formExam.examId,
    questionIdSet: questionIdSet.value
  })
  await addExamQuestionService(examQ);
  // 为竞赛添加题目之后需要重新获取竞赛详情, 以刷新竞赛包含的题目
  getExamDetailById(formExam.examId)
  // 收起对话框
  dialogVisible.value = false
  ElMessage.success('竞赛题目添加成功')
}

async function getExamDetail() {
  const examId = useRoute().query.examId
  if (type === 'edit' && examId) {
    // 先对 formExam 的 examId 进行赋值, 防止后续编辑操作被误认为是新增操作而报错
    formExam.examId = examId
    getExamDetailById(examId)
  }
}
getExamDetail()

async function deleteExamQuestion(examId, questionId) {
  await ElMessageBox.confirm(
    '确认删除?',
    '温馨提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )

  await delExamQuestionService(examId, questionId)
  // 删除竞赛中的题目之后需要重新获取竞赛详情, 以刷新竞赛包含的题目
  getExamDetailById(examId)

  // 删除"待排除展示的题目 Id 集合"中对应元素
  const index = excludeQuestionIdSet.value.indexOf(questionId);
  if (index !== -1) {
    excludeQuestionIdSet.value.splice(index, 1);
  }

  ElMessage.success('竞赛题目删除成功')
}

// 根据竞赛 Id 获取竞赛详情
async function getExamDetailById(examId) {
  const result = await getExamDetailService(examId)
  // 如果删除之后的竞赛不包含题目, 此时由于后端添加了注解, 竞赛题目列表为 null 因此没有进行返回
  // 此时 result.data 就不包含竞赛题目列表这个参数, 无法将 formExam 中的竞赛题目列表置为空, 保持了原来的值
  // 因此此处在赋值之前先手动置为空, 如果 result.data 中包含竞赛题目列表参数, 就可以重新赋值
  // 如果不包含也不会导致 formExam 中的竞赛题目列表保留旧值
  formExam.examQuestionList = []

  Object.assign(formExam, result.data)
  formExam.examDate = [result.data.startTime, result.data.endTime]

  // 将竞赛已包含题目 Id 添加到"待排除展示的题目 Id 集合"中
  // 由于每次添加竞赛题目之后都会刷新竞赛详情, 因此赋值之前先置为空, 避免重复添加
  excludeQuestionIdSet.value = []
  formExam.examQuestionList.forEach(element => {
    excludeQuestionIdSet.value.push(element.questionId);
  });
}
</script>

<style lang="scss" scoped>
.add-exam-component-box {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.exam-list-box {
  background: #fff;
  padding: 20px 24px;

  .question-select-submit {
    margin-left: 0;
    margin-top: 20px;
    width: 100%;
  }

  .exam-list-title {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    position: relative;
    padding: 15px 20px;
    padding-top: 0;

    &.required::before {
      position: absolute;
      content: '*';
      font-size: 20px;
      color: red;
      left: 10px;
    }
  }
}

.add-exam-component {
  width: 100%;
  background: #fff;
  padding-bottom: 120px;
  overflow-y: auto;
  box-sizing: border-box;
  height: calc(100vh - 50px);
  margin-top: -10px;

  .exam-select-question-box {

    background: #fff;
    border-bottom: 1px solid #fff;
    border-radius: 2px;
    width: 100%;

    .exam-add-question {
      font-size: 14px;
      float: right;
      margin: 10px 20px 5px 0;
    }

    .question-select-list {
      margin: 0 0 20px 0;
      height: 200px;
    }
  }

  .exam-base-info-box {
    background: #fff;
    border-bottom: 1px solid #fff;
    border-radius: 2px;
    margin-bottom: 10px;
    width: 100%;
    box-sizing: border-box;

    .exam-base-title {
      width: 100%;
      box-sizing: border-box;
      height: 52px;
      border-bottom: 1px solid #e9e9e9;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .base-title {
        font-size: 16px;
        font-weight: 500;
        color: #333333;
      }

      .go-back {
        color: #999;
        cursor: pointer;
      }
    }

    .exam-base-info {
      box-sizing: border-box;
      border-bottom: 1px solid #e9e9e9;
    }

    .mesage-list-content {
      box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.1);
      background-color: rgba(255, 255, 255, 1);
      border-radius: 10px;
      width: 1200px;
      margin-top: 20px;
    }
  }

  .group-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 64px);
    margin: 24px 0;

    .group-item {
      display: flex;
      align-items: center;
      width: 100%;

      .exam-base-info-button {
        margin-left: 104px;
        width: 420px;
      }

      .item-label {
        font-size: 14px;
        font-weight: 400;
        width: 94px;
        text-align: left;
        color: rgba(0, 0, 0, 0.85);
        position: relative;
        padding-left: 10px;

        &.required::before {
          position: absolute;
          content: '*';
          font-size: 20px;
          color: red;
          left: 0px;
          top: -2px;
        }
      }
    }
  }

  .submit-box {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;

    &.absolute {
      position: absolute;
      width: calc(100% - 48px);
      bottom: 0;
      background: #fff;
      z-index: 999;
    }
  }
}
</style>

<style>
.w-e-text-container {
  min-height: 142px;
}
</style>