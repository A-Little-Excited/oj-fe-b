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