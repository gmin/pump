import { useWallet } from '@solana/wallet-adapter-react';
import {WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {useMemo } from 'react'




export function WalletMultiButtons() {
    const { publicKey } = useWallet()
 
    const address:any = useMemo(() => {
      if (publicKey) {
          const base58 = publicKey.toBase58();
          return base58.slice(0, 4) + '..' + base58.slice(-4);
      } else{
        return 'Select Wallet'
      }
  }, [publicKey]);
  return (
  <div className='wlletButton'>
    <WalletMultiButton >{address}</WalletMultiButton>
  </div>
  )
}
