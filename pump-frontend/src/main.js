import { createPinia } from 'pinia';
import VConsole from 'vconsole';
import { createApp } from 'vue';

import App from '@/App.vue';
import { i18n } from '@/locales';
import router from '@/router';
import { getQueryString } from '@/utils';
import storage from '@/utils/storage';

import 'vant/es/toast/style';
import 'vant/es/dialog/style';
import 'vant/es/notify/style';
import 'vant/es/image-preview/style';

import '@/styles/index.less';

window.env = process.env;

const bootstrap = () => {
  if (getQueryString('debug') || storage.session.getItem('debug')) {
    storage.session.setItem('debug', true);
    new VConsole();
  }

  const pinia = createPinia();
  const app = createApp(App);

  app.use(i18n).use(pinia).use(router).mount('#app');
};

bootstrap();
