<template>
  <el-form inline="true">
    <el-form-item>
      <selector v-model="params.difficulty" placeholder="请选择题目难度" style="width: 200px;"></selector>
    </el-form-item>
    <el-form-item>
      <el-input v-model="params.title" placeholder="请您输入要搜索的题目标题" />
    </el-form-item>
    <el-form-item>
      <el-button plain @click="onSearch">搜索</el-button>
      <el-button plain @click="onReset" type="info">重置</el-button>
      <el-button plain type="primary" :icon="Plus">添加题目</el-button>
    </el-form-item>
  </el-form>
  <el-table height="526px" :data="questionList">
    <el-table-column prop="questionId" width="180px" label="题目id" />
    <el-table-column prop="title" label="题目标题" />
    <el-table-column prop="difficulty" label="题目难度" width="90px">
      <template #default="{ row }">
        <div v-if="row.difficulty === 1" style="color:#3EC8FF;">简单</div>
        <div v-if="row.difficulty === 2" style="color:#FE7909;">中等</div>
        <div v-if="row.difficulty === 3" style="color:#FD4C40;">困难</div>
      </template>
    </el-table-column>
    <el-table-column prop="createName" label="创建人" width="140px" />
    <el-table-column prop="createTime" label="创建时间" width="180px" />
    <el-table-column label="操作" width="100px" fixed="right">
      <template #default="{ row }">
        <el-button type="text">编辑
        </el-button>
        <el-button type="text" class="red">删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination size="small" background layout="total, sizes, prev, pager, next, jumper" :total="totalData" 
  :page-sizes="[5, 10, 15, 20]" @size-change="handleSizeChange" @current-change="handleCurrentChange"
  v-model:page-size="params.pageSize" v-model:current-page="params.pageNum" />
</template>

<script setup>
import { Plus } from "@element-plus/icons-vue"
import Selector from "@/components/QuestionSelector.vue"
import { getQuestionListService } from "@/apis/question";
import { reactive, ref } from "vue";

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  difficulty: '',
  title: ''
})

const questionList = ref([])
// 总记录数, 默认值为 0
const totalData = ref(0)

async function getQuestionList() {
  const result = await getQuestionListService(params)
  console.log(params)
  console.log(result)
  questionList.value = result.data
  totalData.value = result.total
}
// 进入当前页面就是马上自动调用该方法发起请求
getQuestionList()

function handleSizeChange(newSize) {
  // 使用 v-model 将 params.pageSize 与分页组件的每页记录数参数进行绑定之后
  // 当页面上的每页记录数发生改变后, 会直接改变 params.pageSize, 因此可以省略下述代码
  //params.pageSize = newSize
  
  // 当每页记录数发生改变后, 跳转至第一页开始展示而非停留在原先页码, 提升用户体验
  // 使用 v-model 之后, 变量的值发生变化就会引起组件参数的变化
  params.pageNum = 1
  getQuestionList();
}

function handleCurrentChange(newPage) {
  // 使用 v-model 将 params.pageNum 与分页组件的当前页码参数进行绑定之后
  // 当页面上的当前页码发生改变后, 会直接改变 params.pageNum, 因此可以省略下述代码
  params.pageNum = newPage
  getQuestionList()
}

function onSearch() {
  // 与上同理, 当用户根据标题搜索之后, 跳转至搜索结果的第一页开始展示而非停留在原先页码, 提升用户体验
  params.pageNum = 1
  getQuestionList();
}

function onReset() {
  params.pageSize = 10
  params.pageNum = 1
  params.title = ''
  params.difficulty = ''
  getQuestionList()
}
</script>