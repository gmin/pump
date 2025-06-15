<template>
  <van-popup
    v-model:show="show"
    round
    :close-on-click-overlay="false"
    closeable
    class="token-popup"
  >
    <div class="token-container">
      <div class="token-name">
        {{ props.data.metadata.name }}
      </div>

      <div class="input-wrapper">
        <van-field v-model="state.amount" clearable type="digit" placeholder="Buy Amount" />
      </div>

      <van-button color="#4f46e5" block :disabled="!state.amount" @click="handleBuyToken">
        Buy Tokens
      </van-button>

      <van-button color="#4f46e5" block class="withraw-token" @click="handleWithdrawTokens">
        Withdraw Tokens
      </van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { showToast } from 'vant';
import { reactive, ref } from 'vue';

import { loading } from '@/components';
import { buyTokens, withdrawTokens } from '@/web3';

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  onSuccess: {
    type: Function,
    default: () => {},
  },
});
const state = reactive({
  amount: 2000000,
});

const show = ref(false);

const open = () => {
  show.value = true;
};

const close = () => {
  show.value = false;
};

const handleBuyToken = async () => {
  try {
    loading.open();
    await buyTokens(props.data.account.data.parsed.info.mint, state.amount);
    showToast('Success');
    loading.close();
    close();
    props.onSuccess();
  } catch (err) {
    err.message && showToast(err.message);
    loading.close();
  }
};

const handleWithdrawTokens = async () => {
  try {
    loading.open();
    await withdrawTokens(props.data.account.data.parsed.info.mint);
    showToast('Success');
    loading.close();
    close();
  } catch (err) {
    err.message && showToast(err.message);
    loading.close();
  }
};

defineExpose({
  open,
  close,
});
</script>

<style lang="less" scoped>
.token-popup {
  width: 325px;
}

.token-container {
  padding: 20px;
  color: black;

  .token-name {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }

  .input-wrapper {
    padding: 12px 0;
  }

  .withraw-token {
    margin-top: 12px;
  }
}
</style>
