import NProgress from 'nprogress';
import { createRouter, createWebHashHistory } from 'vue-router';

import routes from './routes';

import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
