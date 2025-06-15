import { useClipboard as useOriginalClipboard } from '@vueuse/core';
import { showToast } from 'vant';
import { ref } from 'vue';

import { i18n } from '@/locales';

export const useClipboard = () => {
  const copyToClipboard = async (value = '', successText = i18n.global.t('copied')) => {
    const source = ref(value);
    const { copy } = useOriginalClipboard({ source });

    await copy(source.value);
    showToast(successText);
  };

  return {
    copy: copyToClipboard,
  };
};
