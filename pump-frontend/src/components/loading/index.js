import { createApp } from 'vue';

let root;
let app;
let instance;
let loadingCount = 0;

const loading = (message = '') => {
  if (root) {
    app.unmount();
  } else {
    root = document.createElement('div');
    document.body.appendChild(root);
  }

  app = createApp(require('./Loading.vue').default, {
    message,
    destroy() {
      if (app) {
        app.unmount();
        app = null;
      }

      if (root) {
        document.body.removeChild(root);
        root = null;
      }
    },
  });

  instance = app.mount(root);

  return instance;
};

const open = (message) => {
  if (loadingCount++ > 0) {
    return;
  }

  loading(message).open();
};

const close = () => {
  if (--loadingCount > 0) {
    return;
  }

  instance?.close();
};

export default {
  open,
  close,
};
