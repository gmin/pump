<template>
  <div class="home-page">
    <div class="home-header">
      <div class="logo-wrapper">
        <img src="@/assets/images/logo.png" />
        <span>Bun.Fun</span>
      </div>

      <div class="wallet-wrapper">
        <div class="sol-balance">
          <span>{{ store.solBalance }}</span>
          <img src="@/assets/images/logo.png" />
        </div>

        <div class="connect-wallet">
          <van-button
            v-if="store.formattedWalletAddress"
            size="small"
            @click="copy(store.walletAddress)"
          >
            {{ store.formattedWalletAddress }}
          </van-button>
          <van-button v-else size="small" @click="store.connectWallet">
            {{ 'Collect Wallet' }}
          </van-button>
        </div>
      </div>
    </div>

    <div class="create-token-container">
      <van-button type="primary" block color="#4f46e5">Create Your Own Coin FAST ⚡</van-button>
      <div class="description">Launch your own coin on Solana in seconds. No coding required.</div>

      <form class="form-wrapper">
        <div class="form-item">
          <div class="name">
            <span>*</span>
            Token Name
          </div>
          <van-field v-model="state.tokenName" clearable :maxlength="32" :border="false" />
          <div class="desc">{{ '(Max 32 characters)' }}</div>
        </div>
        <div class="form-item">
          <div class="name">
            <span>*</span>
            Token Symbol
          </div>
          <van-field v-model="state.tokenSymbol" clearable :maxlength="8" :border="false" />
          <div class="desc">{{ '(Max 8 characters)' }}</div>
        </div>
        <div class="form-item">
          <div class="name">
            <span>*</span>
            Decimals
          </div>
          <van-field v-model="state.decimals" clearable :border="false" type="digit" />
        </div>
        <div class="form-item">
          <div class="name">
            <span>*</span>
            Total Supply
          </div>
          <van-field v-model="state.totalSupply" clearable :border="false" type="digit" />
          <div class="desc">{{ '1 billion by default (recommended), 9 decimals' }}</div>
        </div>
        <div class="form-item">
          <div class="name">
            <span>*</span>
            Description
          </div>
          <van-field
            v-model="state.description"
            clearable
            autosize
            :border="false"
            type="textarea"
            placeholder="Describe your token's purpose and vision..."
          />
        </div>
        <div class="form-item">
          <div class="name">
            <span>*</span>
            Token Price
          </div>
          <van-field
            v-model="state.pricePerToken"
            clearable
            type="number"
            :border="false"
            placeholder="Token Price"
          />
        </div>

        <div class="form-item">
          <div class="name">
            <span>*</span>
            Sell Duration (Minutes)
          </div>
          <van-field
            v-model="state.duration"
            clearable
            type="digit"
            :border="false"
            placeholder="Token Price"
          />
        </div>

        <div class="form-item">
          <div class="name">
            <span>*</span>
            Sell Amount
          </div>
          <van-field
            v-model="state.saleAmount"
            clearable
            type="digit"
            :border="false"
            placeholder="Token Price"
          />
        </div>

        <div class="create-btn">
          <van-button type="primary" block color="#4f46e5" @click="handleCreateToken">
            Create
          </van-button>
        </div>
      </form>
    </div>

    <div class="token-accounts-container">
      <div class="token-acounts-header">
        <div>Token Accounts</div>
        <van-button icon="replay" size="mini" @click="fetchTokenAccounts" />
      </div>
      <div class="token-accounts-list">
        <div class="token-accounts-item token-accounts-item-header">
          <div class="token-pubkey">Name</div>
          <div class="token-mint">Mint</div>
          <div class="token-balance">Balance</div>
        </div>
        <div
          v-for="item in state.tokenAccounts"
          :key="item.address"
          class="token-accounts-item"
          @click="showTokenPopup({ data: item, onSuccess: fetchTokenAccounts })"
        >
          <div class="token-pubkey">
            {{ item.metadata?.name || formatWallet(item.pubkey, 4) }}
          </div>
          <div class="token-mint">
            {{ formatWallet(item.account.data.parsed.info.mint, 4) }}
          </div>
          <div class="token-balance">
            {{ item.account.data.parsed.info.tokenAmount.uiAmount.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { showToast } from 'vant';
import { onMounted, reactive } from 'vue';

import { loading } from '@/components';
import { useClipboard } from '@/hooks/useClipboard';
import { showTokenPopup } from '@/popup';
import { useStore } from '@/store';
import { formatWallet } from '@/utils';
import { createToken, getTokenAccounts, initSaleAccount } from '@/web3';

const store = useStore();
const { copy } = useClipboard();

const state = reactive({
  tokenName: '',
  tokenSymbol: '',
  decimals: 9,
  totalSupply: 100000000,
  description: '',
  imageUrl: '',
  pricePerToken: '0.01',
  duration: '30',
  saleAmount: 100000000 * 0.2,
  tokenAccounts: [],
});

onMounted(async () => {
  await store.connectWallet();
  fetchTokenAccounts();
});

const fetchTokenAccounts = async () => {
  state.tokenAccounts = await getTokenAccounts();
};

const handleCreateToken = async () => {
  try {
    if (!store.walletAddress) {
      await store.connectWallet();
    }

    if (!state.tokenName) {
      showToast('Please enter a token name');
      return;
    }

    if (!state.tokenSymbol) {
      showToast('Please enter a token symbol');
      return;
    }

    if (!state.decimals) {
      showToast('Please enter a token decimals');
      return;
    }

    if (!state.totalSupply) {
      showToast('Please enter a token total supply');
      return;
    }

    if (!state.description) {
      showToast('Please enter a token description');
      return;
    }

    if (!state.pricePerToken) {
      showToast('Please enter a token price');
    }

    if (!state.saleAmount) {
      showToast('Please enter a sell amount');
    }

    if (!state.duration) {
      showToast('Please enter a sell duration');
    }

    loading.open();

    const mint = await createToken(
      state.tokenName,
      state.tokenSymbol,
      state.decimals,
      state.totalSupply,
      state.description,
      state.imageUrl,
    );
    state.tokenAccounts = await getTokenAccounts();
    const token = state.tokenAccounts.find((item) => item.account.data.parsed.info.mint === mint);
    console.log('🚀 ~ handleCreateToken ~ token:', token);

    const pricePerToken = Number(state.pricePerToken) * 10 ** 9;
    const saleAmount = Number(state.saleAmount) * 10 ** 9;
    const endTime = dayjs().add(Number(state.duration), 'minutes').unix();
    await initSaleAccount(mint, saleAmount, pricePerToken, endTime);

    loading.close();
    showToast('Success');
  } catch (error) {
    console.log('🚀 ~ handleCreateToken ~ error:', error);
    loading.close();
  }
};
</script>

<style lang="less" scoped>
.home-page {
  .home-header {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid #f8fafc1a;

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      img {
        width: 18px;
      }

      span {
        font-weight: bold;
      }
    }

    .wallet-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;

      .sol-balance {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;

        img {
          width: 18px;
        }
      }

      .connect-wallet {
        .van-button {
          font-weight: bold;
          background-color: #86efac;
          border-color: #86efac;
        }
      }
    }
  }

  .create-token-container {
    padding: 20px;
    margin: auto;

    .van-button {
      font-size: 15px;
      font-weight: bold;
    }

    .description {
      padding: 12px;
      font-size: 12px;
      color: #a3a3a3;
      text-align: center;
    }

    .form-wrapper {
      padding: 20px;
      background: #1e2423;
      border: 1px solid #404040;
      border-radius: 4px;

      .form-item {
        margin-bottom: 16px;

        .name {
          display: flex;
          margin-bottom: 8px;
          font-size: 13px;

          span {
            margin-right: 2px;
            color: var(--red);
          }
        }

        :deep(.van-cell) {
          padding: 6px 12px;
          background: var(--black);
          border-radius: 4px;

          .van-field__control {
            color: var(--white);
          }
        }

        .desc {
          margin-top: 8px;
          font-size: 12px;
          color: #a3a3a3;
        }
      }

      .create-btn {
        margin-top: 24px;
      }
    }
  }

  .token-accounts-container {
    padding: 0 24px 24px;
    margin: auto;

    .token-acounts-header {
      display: flex;
      margin-bottom: 8px;
      font-weight: bold;
      align-items: center;
      justify-content: space-between;
    }

    .token-accounts-list {
      padding: 4px 12px;
      background: #1e2423;
      border: 1px solid #404040;
      border-radius: 4px;

      .token-accounts-item-header {
        font-weight: bold;
      }

      .token-accounts-item {
        display: flex;
        padding: 8px 0;
        font-size: 12px;
        align-items: center;

        .token-pubkey {
          flex: 1;
        }

        .token-mint {
          flex: 1;
        }

        .token-balance {
          flex: 1;
        }
      }
    }
  }
}
</style>
