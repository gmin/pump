import { showPopup } from './core';

export const showTokenPopup = (props) => {
  showPopup(require('./TokenPopup.vue').default, props);
};
