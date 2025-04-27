import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import {  Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { IconRefresh } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { ExplorerLink } from '../cluster/cluster-ui'
import { ellipsify } from '../ui/ui-layout'


import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
} from './account-data-access'
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";


export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address })

  return (
    <div>
      <h1 className="text-5xl font-bold cursor-pointer" onClick={() => query.refetch()}>
        {query.data ? <BalanceSol balance={query.data} /> : '...'} SOL
      </h1>
    </div>
  )
}
export function AccountChecker() {
  const { publicKey } = useWallet()
  if (!publicKey) {
    return null
  }
  return <AccountBalanceCheck address={publicKey} />
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster()
  const mutation = useRequestAirdrop({ address })
  const query = useGetBalance({ address })

  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          You are connected to <strong>{cluster.name}</strong> but your account is not found on this cluster.
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() => mutation.mutateAsync(1).catch((err) => console.log(err))}
        >
          Request Airdrop
        </button>
      </div>
    )
  }
  return null
}

export const AccountTokens = forwardRef<{ refresh: () => Promise<void> }, { address: PublicKey }>(({ address }, ref) => {
  const [showAll, setShowAll] = useState(false)
  const query = useGetTokenAccounts({ address })
  const client = useQueryClient()
  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  const refresh = async () => {
    await query.refetch()
    await client.invalidateQueries({
      queryKey: ['getTokenAccountBalance'],
    })
  }

  useImperativeHandle(ref, () => ({
    refresh
  }))

  return (
    <div className="space-y-2 bg-[#161b19]">
      <div className="justify-between">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-white p-2">Token Accounts</h2>
          <div className="space-x-2">
            {query.isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <button
                className="btn btn-sm btn-outline bg-[#ffffff] hover:bg-[#10141f]"
                onClick={refresh}
              >
                <IconRefresh size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No token accounts found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300  p-2 text-white">
              <thead className='text-white'>
                <tr>
                  <th>Public Key</th>
                  <th>Mint</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {items?.map(({ account, pubkey }) => (
                  <tr key={pubkey.toString()}>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink label={ellipsify(pubkey.toString())} path={`account/${pubkey.toString()}`} />
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <span className="font-mono">
                          <ExplorerLink
                            label={ellipsify(account.data.parsed.info.mint)}
                            path={`account/${account.data.parsed.info.mint.toString()}`}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono">{account.data.parsed.info.tokenAmount.uiAmount}</span>
                    </td>
                  </tr>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button className="btn btn-xs btn-outline btn-outline:hover  bg-[#ffffff] hover:bg-[#10141f]" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
})

export function AccountButtons({ address }: { address: PublicKey}) {

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  // const { cluster } = useCluster()
  // const [showAirdropModal, setShowAirdropModal] = useState(false)
  // const [showReceiveModal, setShowReceiveModal] = useState(false)
  // const [showSendModal, setShowSendModal] = useState(false)

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState(1000000000);
  const [decimals, setDecimals] = useState(9);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountTokensRef = useRef<{ refresh: () => Promise<void> }>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      console.log(selectedFile,error,loading);
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateInputs = () => {
    if (!tokenName.trim()) {
      setError('请输入代币名称');
      return false;
    }
    if (!tokenSymbol.trim()) {
      setError('请输入代币符号');
      return false;
    }
    if (tokenSupply <= 0) {
      setError('初始供应量必须大于0');
      return false;
    }
    if (decimals < 0 || decimals > 9) {
      setError('小数位数必须在0-9之间');
      return false;
    }
    return true;
  };


  const createToken = async () => {
    if (!publicKey) throw new Error("钱包未连接");
    if (!validateInputs()) return false
    setLoading(true)
    // if(!file) throw new Error("请选择文件");

    // 生成Mint账户密钥对
    const mintKeypair = Keypair.generate();

    // const lamports = await getMinimumBalanceForRentExemption(connection)
    // 1. 创建Mint账户的指令
    const createMintIx = SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: 82, // Mint账户的固定大小
      lamports: await connection.getMinimumBalanceForRentExemption(82),
      programId: TOKEN_PROGRAM_ID,
    });

    // 2. 初始化Mint的指令
    const initMintIx = await createInitializeMintInstruction(
      mintKeypair.publicKey, // Mint地址
      decimals, // 小数位
      publicKey, // 铸币权限
      publicKey, // 冻结权限
      TOKEN_PROGRAM_ID
    );

    // 3. 创建关联代币账户
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      publicKey
    );

    const createATAInstruction = createAssociatedTokenAccountInstruction(
      publicKey,
      associatedTokenAccount,
      publicKey,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // 4. 铸币到关联账户
    const mintToIx = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAccount,
      publicKey,
      1000000000 * tokenSupply // 铸造数量
    );

    const payer: any = publicKey;
    const METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const metadataAccount = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    )[0];

    // const metadata = {
    //   "name": "My Token",
    //   "symbol": "MTK",
    //   "description": "This is my custom token",
    //   "image": "https://ipfs.io/your-image.png",
    //   "external_url": "https://your-website.com",
    //   "attributes": [
    //     { "trait_type": "Rarity", "value": "Common" }
    //   ],
    //   "properties": {
    //     "files": [
    //       {
    //         "uri": "https://ipfs.io/your-image.png",
    //         "type": "image/png"
    //       }
    //     ],
    //     "category": "token"
    //   }
    // }
    // const metadataCid = await uploadMetadata(metadata)
    // const iks:any = metadataAddress
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAccount,
        mint: mintKeypair.publicKey,
        mintAuthority: publicKey, // 必须有铸币权限
        payer,
        updateAuthority: publicKey, // 元数据更新权限
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "Metaplex Token",
            symbol: "MPLX",
            uri: "https://5qonlmdunmih2jlu2obartr7cngqdcagfysp7rccfkxxarrt3wda.arweave.net/7BzVsHRrEH0ldNOCCM4_E00BiAYuJP_EQiqvcEYz3YY",
            sellerFeeBasisPoints: 0, // 版税比例 (0-10000)
            creators: null, // 可添加创作者列表
            collection: null,
            uses: null,
          },
          isMutable: true, // 是否允许后续修改
          collectionDetails: null,
        },
      }
    );
    // const latestBlockhash = await connection.getLatestBlockhash();
    // 构建交易
    const transaction = new Transaction().add(
      createMintIx,
      initMintIx,
      createATAInstruction,
      mintToIx,
      createMetadataInstruction
    );

    const signature = await sendTransaction(transaction, connection, {
      signers: [mintKeypair], // Mint账户需要签名
    });
    await connection.confirmTransaction(signature, "confirmed");
    setLoading(false)
    await accountTokensRef.current?.refresh()
    return mintKeypair.publicKey.toString();
  };
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  const nextTab = () => {
    if (!previewUrl || !tokenName || !tokenSymbol) {
      return false
    }
    setStep(2)
  }
  return (
    <div className="w-full rounded-lg p-6 text-white">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-white bg-indigo-600 px-4 py-2 rounded-lg Lexend text-center">Create Your Own Coin FAST ⚡</h1>
      <p className="text-base sm:text-lg text-neutral-400 text-center mb-6 sm:mb-0">Launch your own coin on Solana in seconds. No coding required.</p>
      <div className='space-y-8 w-full max-w-[900px] mx-auto sm:mt-14 sm:mb-8 p-4 sm:p-10 border border-neutral-700 rounded-lg bg-[#1e2423]'>
        <div className="mb-4"><div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Step 1 of 2</h2>
        </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-indigo-600 rounded-full" style={{ width: step==1? '50%':'100%' }}></div>
          </div>
        </div>

        <div>
          {step == 1 ?
            <div className="space-y-6 sm:space-y-8 rounded-lg text-white ">
              <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
                <div className="flex-1">
                  <label htmlFor="name" className="block text-sm sm:text-base font-medium mb-2 text-left">
                    <span className="text-red-500">*</span> Token Name
                  </label>
                  <input
                    id="name"
                    placeholder="Meme Coin"
                    maxLength={32}
                    className="p-2 sm:p-3 block w-full rounded-md bg-[#111617] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  text-base"
                    type="text"
                    name="name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-400 text-left">(max 32 characters)</p>
                </div>
                <div className="flex-1">
                  <label htmlFor="symbol" className="block text-sm sm:text-base font-medium mb-2 text-left">
                    <span className="text-red-500">*</span> Token Symbol
                  </label>
                  <input
                    id="symbol"
                    required
                    maxLength={8}
                    placeholder="MEMC"
                    className="p-2 sm:p-3 block w-full rounded-md bg-[#111617] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  text-base"
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    name="symbol"
                  />
                  <p className="mt-1 text-xs text-gray-400 text-left">(max 8 characters)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-medium mb-2 text-left">
                  <span className="text-red-500">*</span> Image
                </label>
                <div
                  className="border-2 
                border-dashed border-gray-300 
                rounded-lg p-4 
                cursor-pointer hover:border-indigo-500
                 transition-colors min-h-[150px] 
                 sm:min-h-[200px] flex items-center 
                 justify-center relative"
                  onClick={handleClick}
                >
                  <input
                    accept="image/*,.jpeg,.jpg,.png,.gif"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                    ref={fileInputRef}

                    style={{
                      clip: 'rect(0px, 0px, 0px, 0px)',
                      clipPath: 'inset(50%)',
                      border: 0,
                      height: '100%',
                      margin: "0 -1px -1px 0",
                      padding: 0,
                      position: "absolute",
                      width: '100%',
                      whiteSpace: "nowrap"
                    }}
                  />
                  <div className="w-full flex flex-col items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-32 w-auto" />
                    ) : (
                      <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    )}
                    {!previewUrl &&
                      <p className="mt-2 text-sm text-neutral-400">Click or drag to upload your token logo (500x500)</p>
                    }</div>
                </div>
              </div>
            </div> :
            <div>
               <div className="">
                <label htmlFor="symbol" className="block text-sm sm:text-base font-medium mb-2 text-left">
                  <span className="text-red-500">*</span> Decimals
                </label>
                <input id="decimals"
                  value={decimals}
                  onChange={(e: any) => setDecimals(e.target.value)}
                  className="p-2 sm:p-3 block w-full rounded-md bg-[#111617] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  text-base"
                  type="number" name="totalSupply" />
                {/* <p className=" text-xs sm:text-sm text-neutral-400 mt-2 text-left">1 billion by default (recommended), 6 decimals</p> */}
              </div>
              <div className="mt-8">
                <label htmlFor="symbol" className="block text-sm sm:text-base font-medium mb-2 text-left">
                  <span className="text-red-500">*</span> Total Supply
                </label>
                <input id="totalSupply"
                  value={tokenSupply}
                  onChange={(e: any) => setTokenSupply(e.target.value)}
                  className="p-2 sm:p-3 block w-full rounded-md bg-[#111617] border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500  text-base"
                  type="number" name="totalSupply" />
                <p className=" text-xs sm:text-sm text-neutral-400 mt-2 text-left">1 billion by default (recommended), 9 decimals</p>
              </div>
              <div className='mt-8'>
                <label className="block text-sm sm:text-base font-medium mb-2 text-left"  >
                  <span className="text-red-500">*</span> Description
                </label>
                <textarea id="description"

                  className="p-2 sm:p-4 block w-full rounded-md bg-[#111617] border-gray-300 shadow-sm focus:border-indigo-500
               focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-base h-[120px]"
                  placeholder="Describe your token's purpose and vision..."></textarea>
              </div></div>}
        </div>
        <div className="flex flex-col sm:flex-row justify-between sm:mt-8 sm:pb-0 space-y-0 sm:space-y-0">
          <div className="w-full sm:w-auto order-2 sm:order-1 mt-4 sm:mt-0">
            {step == 2 && <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-4 py-2 border 
                border-transparent rounded-md shadow-sm font-bold text-white  focus:outline-none 
                text-sm sm:text-base flex items-center bg-[#10141f]  hover:bg-[#10141f]
                justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg><span>Back</span>
            </button>}
          </div>
          <div className="w-full sm:w-auto order-1 sm:order-2">
            {
              step == 1 ?
                <button
                  onClick={nextTab}
                  className={`w-full sm:w-auto px-4 py-2 border 
                border-transparent rounded-md shadow-sm font-bold text-white 
                bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                text-sm sm:text-base flex items-center 
                justify-center space-x-2 ${(!tokenName || !previewUrl || !tokenSymbol) ? 'disabled' : ''}`}

                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button> :
                <button
                  onClick={() => createToken()}
                  className="w-full sm:w-auto px-4 py-2 border 
                border-transparent rounded-md shadow-sm font-bold text-white 
                bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                text-sm sm:text-base flex items-center 
                justify-center space-x-2">
                  <span>Create</span>
                </button>}
          </div>
        </div>
      </div>
      <div className="space-y-8">
          <AccountTokens ref={accountTokensRef} address={address} />
          <AccountChecker  />
      </div>
      <div className="w-full max-w-[900px]  rounded-2xl p-4 sm:p-8  mb-8 sm:mb-16 mt-8 border border-neutral-700 bg-[#1e2423] text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-8">How to use Solana Token Creator</h2>
        <h3 className="text-base sm:text-lg text-white mb-4 sm:mb-6">Follow these simple steps:</h3>
        <ol className="list-decimal list-inside space-y-2 sm:space-y-4 text-base sm:text-lg text-white ml-2 sm:ml-4">
          <li>Connect your Solana wallet.</li>
          <li>Write the name you want for your Token.</li>
          <li>Indicate the symbol (max 8 characters).</li>
          <li>Write the description you want for your SPL Token.</li>
          <li>Upload the image for your token (PNG).</li>
          <li>Put the supply of your Token.</li>
          <li>Click on Create, accept the transaction, and wait until your token is ready.</li>
        </ol>
        <div className="mt-4 sm:mt-8 space-y-2 sm:space-y-4 text-sm sm:text-base text-left">
          <p className="text-white">The cost of creating the Token is <span className="text-[#22c55f]">0.1 SOL</span>, which includes all fees needed for the SPL Token creation.</p>
          <p className="text-white">The creation process will start and will take some seconds. After that, you will receive the total supply of the token in the wallet you chose.</p>
        </div>
      </div>


      <div className="w-full max-w-[900px] bg-[#1e2423] rounded-2xl p-4 sm:p-8  mb-8  border border-neutral-700 text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-8">Frequently Asked Questions</h2>

        <div className="space-y-2 sm:space-y-4">
          {/* FAQ Item 1 */}
          <div className="border border-neutral-700 rounded-lg">
            <button className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center text-left ">
              <h3 className="text-base sm:text-lg font-medium text-white">
                What is Solana, and why should I launch my token on it?
              </h3>
              {/* <svg className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                  className="text-white" />
              </svg> */}
            </button>
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <p className="text-sm sm:text-base text-neutral-400">
                Solana is a high-performance blockchain platform known for its fast transactions, low fees, and scalability. It's an excellent choice for launching tokens due to its growing ecosystem, strong developer community, and widespread adoption in the crypto space.
              </p>
            </div>
          </div>

          {/* FAQ Item 2 */}
          <div className="border border-neutral-700 rounded-lg">
            <button className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center text-left">
              <h3 className="text-base sm:text-lg font-medium text-white">
                How can I create a token on the Solana blockchain?
              </h3>
              {/* <svg className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                  className="text-white" />
              </svg> */}
            </button>
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <p className="text-sm sm:text-base text-neutral-400">
                Creating a token on Solana is straightforward with our platform. Simply connect your wallet, fill in your token details (name, symbol, supply, etc.), customize settings if needed, and submit. Our tool handles all the technical aspects of token creation for you.
              </p>
            </div>
          </div>

          {/* FAQ Item 3 */}
          <div className="border border-neutral-700 rounded-lg">
            <button className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center text-left">
              <h3 className="text-base sm:text-lg font-medium text-white">
                What are the steps to deploy my own token on Solana?
              </h3>
              {/* <svg className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                  className="text-white" />
              </svg> */}
            </button>
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <p className="text-sm sm:text-base text-neutral-400">
                The process involves: 1) Connecting your Solana wallet, 2) Providing token details like name and symbol, 3) Setting the supply and decimals, 4) Uploading token image and metadata, 5) Configuring optional settings like freeze authority, and 6) Confirming the transaction. Our platform guides you through each step.
              </p>
            </div>
          </div>

          {/* FAQ Item 4 */}
          <div className="border border-neutral-700 rounded-lg">
            <button className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center text-left">
              <h3 className="text-base sm:text-lg font-medium text-white">
                How can I manage token authorities on Solana?
              </h3>
              {/* <svg className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                  className="text-white" />
              </svg> */}
            </button>
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <p className="text-sm sm:text-base text-neutral-400">
                Token authorities on Solana can be managed through our platform. You can set and revoke different authorities like freeze, mint, and update authority during token creation. These settings determine who can perform certain actions with your token after deployment.
              </p>
            </div>
          </div>

          {/* FAQ Item 5 */}
          <div className="border border-neutral-700 rounded-lg">
            <button className="w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center text-left">
              <h3 className="text-base sm:text-lg font-medium text-white">
                What platforms can assist with launching a token on Solana?
              </h3>
              {/* <svg className="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                  className="text-white" />
              </svg> */}
            </button>
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <p className="text-sm sm:text-base text-neutral-400">
                There are several platforms available, including coinblast.fun (our platform), which provides a user-friendly interface for token creation. Other options include Solana's CLI tools and various development frameworks, but our platform offers the most straightforward solution for non-technical users, without any coding required.
              </p>
            </div>
          </div>
        </div>
      </div>

 
    </div>

  )
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <div className="">
      <div className="flex justify-between">
        <div className="">
          {query.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <button className="btn btn-sm btn-outline btn-outline:hover" onClick={() => query.refetch()}>
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </div>
      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            <table className="table rounded-lg border-separate border-base-300  bg-white mb-5">
              <thead>
                <tr className=''>
                  <th>Signature</th>
                  <th className="text-right">Slot</th>
                  <th>Block Time</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.signature}>
                    <th className="font-mono">
                      <ExplorerLink path={`tx/${item.signature}`} label={ellipsify(item.signature, 8)} />
                    </th>
                    <td className="font-mono text-right">
                      <ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()} />
                    </td>
                    <td>{new Date((item.blockTime ?? 0) * 1000).toISOString()}</td>
                    <td className="text-right">
                      {item.err ? (
                        <div className="badge badge-error" title={JSON.stringify(item.err)}>
                          Failed
                        </div>
                      ) : (
                        <div className="badge badge-success">Success</div>
                      )}
                    </td>
                  </tr>
                ))}
                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button className="btn btn-xs btn-outline" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function BalanceSol({ balance }: { balance: number }) {
  return Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000
}

// function ModalReceive({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
//   return (
//     <AppModal title="Receive" hide={hide} show={show}>
//       <p>Receive assets by sending them to your public key:</p>
//       <code>{address.toString()}</code>
//     </AppModal>
//   )
// }

// function ModalAirdrop({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
//   const mutation = useRequestAirdrop({ address })
//   const [amount, setAmount] = useState('2')

//   return (
//     <AppModal
//       hide={hide}
//       show={show}
//       title="Airdrop"
//       submitDisabled={!amount || mutation.isPending}
//       submitLabel="Request Airdrop"
//       submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
//     >
//       <input
//         disabled={mutation.isPending}
//         type="number"
//         step="any"
//         min="1"
//         placeholder="Amount"
//         className="input input-bordered w-full"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />
//     </AppModal>
//   )
// }

// function ModalSend({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
//   const wallet = useWallet()
//   const mutation = useTransferSol({ address })
//   const [destination, setDestination] = useState('')
//   const [amount, setAmount] = useState('1')

//   if (!address || !wallet.sendTransaction) {
//     return <div>Wallet not connected</div>
//   }

//   return (
//     <AppModal
//       hide={hide}
//       show={show}
//       title="Send"
//       submitDisabled={!destination || !amount || mutation.isPending}
//       submitLabel="Send"
//       submit={() => {
//         mutation
//           .mutateAsync({
//             destination: new PublicKey(destination),
//             amount: parseFloat(amount),
//           })
//           .then(() => hide())
//       }}
//     >
//       <input
//         disabled={mutation.isPending}
//         type="text"
//         placeholder="Destination"
//         className="input input-bordered w-full"
//         value={destination}
//         onChange={(e) => setDestination(e.target.value)}
//       />
//       <input
//         disabled={mutation.isPending}
//         type="number"
//         step="any"
//         min="1"
//         placeholder="Amount"
//         className="input input-bordered w-full"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />
//     </AppModal>
//   )
// }

