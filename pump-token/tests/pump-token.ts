import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PumpToken } from "../target/types/pump_token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

describe("pump-token", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PumpToken as Program<PumpToken>;
  
  // 测试初始化代币
  it("Initialize token", async () => {
    // 创建代币铸造账户
    const mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      9 // 小数位数
    );
    console.log("Created mint:", mint.toBase58());

    // 创建代币账户
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );
    console.log("Created token account:", tokenAccount.address.toBase58());

    // 初始化代币
    const [token] = PublicKey.findProgramAddressSync(
      [Buffer.from("token"), mint.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeToken(
        9, // decimals
        "Pump Token", // name
        "PUMP", // symbol
        "https://example.com/token.json" // uri
      )
      .accounts({
        token: token,
        mint: mint,
        authority: provider.wallet.publicKey,
        metadata: tokenAccount.address,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Token initialized!");
  });
}); 