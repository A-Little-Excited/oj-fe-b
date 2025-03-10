<template>
  <el-form inline="true">
    <el-form-item label="创建日期">
      <el-date-picker v-model="datetimerange" style="width: 240px" type="datetimerange" range-separator="至"
        start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
    </el-form-item>
    <el-form-item label="竞赛名称">
      <el-input v-model="params.title" placeholder="请您输入要搜索的竞赛名称" />
    </el-form-item>
    <el-form-item>
      <el-button @click="onSearch" plain>搜索</el-button>
      <el-button @click="onReset" plain type="info">重置</el-button>
      <el-button type="primary" :icon="Plus" plain @click="onAddExam">添加竞赛</el-button>
    </el-form-item>
  </el-form>
  <!-- 表格 -->
  <el-table height="526px" :data="examList">
    <el-table-column prop="title" label="竞赛标题"/>
    <el-table-column prop="startTime" width="180px" label="竞赛开始时间" />
    <el-table-column prop="endTime" width="180px" label="竞赛结束时间" />
    <el-table-column label="是否开赛" width="100px">
      <template #default="{ row }">
        <div v-if="!isNotStartExam(row)">
          <el-tag type="warning">已开赛</el-tag>
        </div>
        <div v-else>
          <el-tag type="info">未开赛</el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="status" width="100px" label="是否发布">
      <template #default="{ row }">
        <div v-if="row.status == 0">
          <el-tag type="danger">未发布</el-tag>
        </div>
        <div v-if="row.status == 1">
          <el-tag type="success">已发布</el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="createName" width="140px" label="创建用户" />
    <el-table-column prop="createTime" width="180px" label="创建时间" />
    <el-table-column label="操作" width="180px">
      <template #default="{ row }">
        <el-button v-if="isNotStartExam(row)" type="text" @click="onEdit(row.examId)">编辑
        </el-button>
        <el-button v-if="isNotStartExam(row)" type="text" @click="onDelete(row.examId)" class="red">删除
        </el-button>
        <el-button v-if="row.status == 1 && isNotStartExam(row)" type="text"
          @click="cancelPublishExam(row.examId)">撤销发布</el-button>
        <el-button v-if="row.status == 0 && isNotStartExam(row)" type="text"
          @click="publishExam(row.examId)">发布</el-button>
        <el-button type="text" v-if="!isNotStartExam(row)">已开赛，不允许操作</el-button>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页区域 -->
  <el-pagination background size="small" layout="total, sizes, prev, pager, next, jumper" :total="totalData"
    v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15, 20]"
    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { getExamListService } from '@/apis/exam'
import { reactive, ref } from 'vue'

// 取当前时间和竞赛开始进行比较, 页面部分根据结果判断展示是否是未开赛
// true: 未开赛, false: 已开赛
function isNotStartExam(exam) {
  const now = new Date();  //当前时间
  console.log(new Date(exam.startTime))
  return new Date(exam.startTime) > now
}

const params = reactive({
  pageNum: 1,
  pageSize: 10,
  startTime: '',
  endTime: '',
  title: ''
})

const examList = ref([])
const totalData = ref(0)
// 与时间选择器双向绑定的响应式数据, 由于可以选择范围的时间选择器中的数据是数组类型的, 因此此处也应该定义为数组
// 前一个表示开始时间, 后一个表示结束时间
const datetimerange = ref([])

async function getExamList() {
  // 由于后端接收的参数是字符串类型, 因此此处需要进行类型转换
  // 并且需要先判断是否选择了日期, 选择之后该数据才为日期类型, 如果没有选择为初始值'', 是字符串类型
  // 只有为日期类型才可以进行类型转换, 因此只有选择了日期再进行类型转换
  if (datetimerange.value[0] instanceof Date) {
    params.startTime = datetimerange.value[0].toISOString()
  }
  if (datetimerange.value[1] instanceof Date) {
    params.endTime = datetimerange.value[1].toISOString()
  }
  const result = await getExamListService(params)
  examList.value = result.data
  totalData.value = result.total
}
// 进入当前页面就是马上自动调用该方法发起请求
getExamList()

function handleSizeChange(newSize) {
  params.pageNum = 1
  getExamList();
}

function handleCurrentChange(newPage) {
  getExamList()
}

function onSearch() {
  params.pageNum = 1
  getExamList();
}

// 点击"重置"按钮将页面重置为第一页
function onReset() {
  params.pageSize = 10
  params.pageNum = 1
  params.title = ''
  params.startTime = ''
  params.endTime = ''

  // 需要同时将 datetimerange 参数置空, 否则进入 getExamList 会重新将 startTime 和 endTime 进行赋值
  datetimerange.value.length = 0
  getExamList()
}
</script>