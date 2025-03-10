import service from "@/utils/request";

export function getExamListService(params = {}) {
  return service({
    url: '/exam/list',
    method: 'get',
    params: params
  });
}