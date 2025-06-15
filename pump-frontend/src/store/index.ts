import { defineStore } from 'pinia';

import { formatWallet } from '@/utils';
import { connectWallet, getSolBalance } from '@/web3';

export const useStore = defineStore('store', {
  state: () => {
    return {
      walletAddress: '',
      solBalance: '0.00',
    };
  },
  actions: {
    setWalletAddress(walletAddress) {
      this.walletAddress = walletAddress;
    },
    async connectWallet() {
      const walletAddress = await connectWallet();

      this.setWalletAddress(walletAddress);
      this.onWalletConnected();
    },
    async getSolBalance() {
      const balance = await getSolBalance();

      this.solBalance = balance;
    },
    async onWalletConnected() {
      this.getSolBalance();
    },
  },
  getters: {
    formattedWalletAddress: (state) => formatWallet(state.walletAddress),
  },
});
