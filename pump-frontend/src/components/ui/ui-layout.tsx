import { ReactNode, Suspense, useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
// import { Link, useLocation } from 'react-router-dom'

// import { AccountChecker } from '../account/account-ui'
// ClusterChecker, ClusterUiSelect,
import { ExplorerLink } from '../cluster/cluster-ui'
import { WalletMultiButtons } from '../solana/walletMultiButton';
import { useGetBalance } from '../account/account-data-access';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
export function UiLayout({ children }: { children: ReactNode; links: { label: string; path: string }[] }) {
  // const pathname = useLocation().pathname
  const keys: any = useWallet()


  const query = useGetBalance({ address: keys.publicKey })

  return (
    <div className="bg-background flex min-h-screen">
      {/* <div className='sticky bottom-0 left-0 top-0  px-2 py-6 gap-8 flex h-screen min-h-screen flex-col border-r border-r-[rgba(248,250,252,0.1)] min-w-[212px] bg-[#1B1D27]'>
        <div className='flex text-white'>
          Bee
        </div>
        <nav >
          <ul className=' flex-col gap-3 group relative flex h-[14px] items-center cursor-default text-[#ffffff] '>
            <li className='w-full rounded-[8px] p-2 cursor-pointer hover:bg-[#262b37]'>
              <span className='whitespace-nowrap sidebar-label-transition-multi text-[#87EF9B] left-[10px] top-1 text-sm leading-none '>
                创建Token
              </span>
            </li>
            <li className='w-full rounded-[8px] p-2 cursor-pointer hover:bg-[#262b37]'>
              <span className=' whitespace-nowrap sidebar-label-transition-multi text-[#ffffff] left-[10px] top-1 text-sm leading-none'>
                代币增发
              </span>
            </li>
            <li className='w-full rounded-[8px] p-2 cursor-pointer hover:bg-[#262b37]'>
              <span className=' whitespace-nowrap sidebar-label-transition-multi text-[#ffffff] left-[10px] top-1 text-sm leading-none'>
                燃烧代币
              </span>
            </li>
            <li className='w-full rounded-[8px] p-2 cursor-pointer hover:bg-[#262b37]'>
              <span className=' whitespace-nowrap sidebar-label-transition-multi text-[#ffffff] left-[10px] top-1 text-sm leading-none'>
                创建流动性
              </span>
            </li>
          </ul>
        </nav>
      </div> */}
      <div className="flex-1  ml-0" >
        <div className='z-11 relative flex flex-col justify-between md:px-6  border-b border-b-[rgba(248,250,252,0.1)]' style={{ flexFlow: 'row-reverse' }}>
          <div className='flex justify-between gap-3 py-2'>
            <div className='flex bg-[#161b19]'>
              <div className="mr-4 sm:px-4 py-1  text-neutral-300 rounded-md text-sm sm:h-11 flex items-center gap-2"><span>{query.data ? Math.round((query.data / LAMPORTS_PER_SOL) * 100000) / 100000 : '...'} </span>
                <div className="w-4  relative">
                  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 397.7 311.7">
                    <style type="text/css">
                      {`.st0{fill:url(#SVGID_1_)}`}
                      {`.st1{fill:url(#SVGID_2_)}`}
                      {`.st2{fill:url(#SVGID_3_)}`}
                    </style>
                    <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="360.8791" y1="351.4553" x2="141.213" y2="-69.2936" gradientTransform="matrix(1 0 0 -1 0 314)">
                      <stop offset="0" style={{ stopColor: '#00FFA3' }} />
                      <stop offset="1" style={{ stopColor: '#DC1FFF' }} />
                    </linearGradient>
                    <path className="st0" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5
      c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
                    <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="264.8291" y1="401.6014" x2="45.163" y2="-19.1475" gradientTransform="matrix(1 0 0 -1 0 314)">
                      <stop offset="0" style={{ stopColor: '#00FFA3' }} />
                      <stop offset="1" style={{ stopColor: '#DC1FFF' }} />
                    </linearGradient>
                    <path className="st1" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5
      c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
                    <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="312.5484" y1="376.688" x2="92.8822" y2="-44.061" gradientTransform="matrix(1 0 0 -1 0 314)">
                      <stop offset="0" style={{ stopColor: '#00FFA3' }} />
                      <stop offset="1" style={{ stopColor: '#DC1FFF' }} />
                    </linearGradient>
                    <path className="st2"
                      d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4
      c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
                  </svg>

                </div>
              </div>
            </div>
            <div className='flex gap-3 wlletButton h-4' ><WalletMultiButtons /></div>
          </div>
          <div className="flex items-center ">

            <div className='w-4 h-4 relative mr-2'>
              <svg className=" w-4 h-4 " version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 397.7 311.7">
                <style type="text/css">
                  {`.st0{fill:url(#SVGID_1_)}`}
                  {`.st1{fill:url(#SVGID_2_)}`}
                  {`.st2{fill:url(#SVGID_3_)}`}
                </style>
                <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="360.8791" y1="351.4553" x2="141.213" y2="-69.2936" gradientTransform="matrix(1 0 0 -1 0 314)">
                  <stop offset="0" style={{ stopColor: '#00FFA3' }} />
                  <stop offset="1" style={{ stopColor: '#DC1FFF' }} />
                </linearGradient>
                <path className="st0" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5
      c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
                <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="264.8291" y1="401.6014" x2="45.163" y2="-19.1475" gradientTransform="matrix(1 0 0 -1 0 314)">
                  <stop offset="0" style={{ stopColor: '#00FFA3' }} />
                  <stop offset="1" style={{ stopColor: '#DC1FFF' }} />
                </linearGradient>
                <path className="st1" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5
      c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
                <linearGradient id="SVGID_3_" gradientUnits="userSpaceOnUse" x1="312.5484" y1="376.688" x2="92.8822" y2="-44.061" gradientTransform="matrix(1 0 0 -1 0 314)">
                  <stop offset="0" style={{ stopColor: '#00FFA3' }} />
                  <stop offset="1" style={{ stopColor: '#DC1FFF' }} />
                </linearGradient>
                <path className="st2"
                  d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4
      c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
              </svg>
            </div>
            <div className="text-lg sm:text-2xl font-bold Lexend text-white">
              BeeFun
            </div>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
    </div >
  )
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode
  title: string
  hide: () => void
  show: boolean
  submit?: () => void
  submitDisabled?: boolean
  submitLabel?: string
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (!dialogRef.current) return
    if (show) {
      dialogRef.current.showModal()
    } else {
      dialogRef.current.close()
    }
  }, [show, dialogRef])

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button className="btn btn-xs lg:btn-md btn-primary" onClick={submit} disabled={submitDisabled}>
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export function AppHero({
  children,
}: {
  children?: ReactNode
  title: ReactNode
  subtitle: ReactNode
}) {
  return (
    <div className="hero py-[64px] w-full bg-[#161b19]">
      <div className="hero-content text-center w-full max-w-[800px]">
        {children}
      </div>
    </div>
  )
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
  }
  return str
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink path={`tx/${signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" />
      </div>,
    )
  }
}
