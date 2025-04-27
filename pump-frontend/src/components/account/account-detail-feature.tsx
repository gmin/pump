import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useParams } from 'react-router'
// import { ExplorerLink } from '../cluster/cluster-ui'
import { AppHero } from '../ui/ui-layout'
import { AccountButtons} from './account-ui'

export default function AccountDetailFeature() {
  const params = useParams() as { address?: string }
  const address = useMemo(() => {
    if (!params.address) {
      return
    }
    try {
      return new PublicKey(params.address)
    } catch (e) {
      console.log(`Invalid public key`, e)
    }
  }, [params])
  if (!address) {
    return <div>Error loading account</div>
  }

  return (
    <div>
      <AppHero
        title={null}
        subtitle={null   }
      >
          <AccountButtons address={address} />
      </AppHero>
     

      <div className="text-xs sm:text-sm text-neutral-500 flex flex-wrap items-center justify-between bg-[#161b19] p-4">
        {/* Copyright */}
        <span>© 2025 Bee.fun | All Rights Reserved</span>

        {/* Social Links */}
        <div className="flex items-center space-x-4">
          {/* Telegram */}
          <a href="https://t.me/beefun" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-neutral-300 hover:text-white flex items-center gap-2 transition-colors">
            <svg viewBox="0 0 24 24" 
                 xmlns="http://www.w3.org/2000/svg" 
                 className="w-4 h-4 fill-blue-500">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
            </svg>
            Support on Telegram
          </a>

          {/* Twitter */}
          <a href="https://x.com/beefun" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-neutral-300 hover:text-white flex items-center gap-2 transition-colors">
            <svg viewBox="0 0 24 24" 
                 xmlns="http://www.w3.org/2000/svg" 
                 className="w-4 h-4 fill-neutral-800">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow on Twitter
          </a>

          {/* Discord */}
          <a href="https://discord.com/invite/xxxx" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="text-neutral-300 hover:text-white flex items-center gap-2 transition-colors">
            <svg viewBox="0 0 24 24" 
                 xmlns="http://www.w3.org/2000/svg" 
                 className="w-4 h-4 fill-indigo-500">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.02.06.03.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" />
            </svg>
            Join our Discord
          </a>
        </div>
      </div>
      
    </div>
  )
}
