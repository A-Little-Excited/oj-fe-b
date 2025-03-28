import service from "@/utils/request";

export function getExamListService(params = {}) {
  return service({
    url: '/exam/list',
    method: 'get',
    params: params
  });
}

export function addExamService(params = {}) {
  return service({
    url: '/exam/add',
    method: 'post',
    data: params
  })
}

export function addExamQuestionService(params = {}) {
  return service({
    url: '/exam/examQuestion/add',
    method: 'post',
    data: params
  })
}

export function getExamDetailService(examId) {
  return service({
    url: '/exam/detail',
    method: 'get',
    params: { examId }
  })
}

export function editExamService(params = {}) {
  return service({
    url: '/exam/edit',
    method: 'put',
    data: params
  })
}

export function delExamQuestionService(examId, questionId) {
  return service({
    url: '/exam/examQuestion/delete',
    method: 'delete',
    params: { examId, questionId }
  })
}

export function delExamService(examId) {
  return service({
    url: '/exam/delete',
    method: 'delete',
    params: { examId }
  })
}
