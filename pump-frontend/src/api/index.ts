import request from '@/utils/request';

export function fetchUserInfo() {
  return request({
    url: '/mock/user/info',
  });
}

export function fetchUserList() {
  return request({
    url: '/mock/user/list',
  });
}
