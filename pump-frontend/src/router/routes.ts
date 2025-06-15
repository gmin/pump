import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      auth: true,
    },
    component: () => import('@/views/home/Home.vue'),
  },
];

export default routes;
