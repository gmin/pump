/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sell_token.json`.
 */
export type SellToken = {
  address: '8u2V6SHBURgDV23rvWFKBvPvhthYKP3eHfYgGJzQHLps';
  metadata: {
    name: 'sellToken';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'buyToken';
      discriminator: [138, 127, 14, 91, 38, 87, 115, 105];
      accounts: [
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
          };
        },
        {
          name: 'pdaAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
            ];
          };
        },
        {
          name: 'tokenMint';
          writable: true;
        },
        {
          name: 'buyTokenMint';
          writable: true;
        },
        {
          name: 'buyer';
          writable: true;
          signer: true;
        },
        {
          name: 'buyerTokenAccount';
          writable: true;
        },
        {
          name: 'saleTokenAccount';
          writable: true;
        },
        {
          name: 'saleSellTokenAccount';
          writable: true;
        },
        {
          name: 'cpSwapProgram';
          address: 'CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW';
        },
        {
          name: 'ammConfig';
        },
        {
          name: 'authority';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100,
                ];
              },
            ];
            program: {
              kind: 'account';
              path: 'cpSwapProgram';
            };
          };
        },
        {
          name: 'poolState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108];
              },
              {
                kind: 'account';
                path: 'ammConfig';
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
              {
                kind: 'account';
                path: 'buyTokenMint';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpSwapProgram';
            };
          };
        },
        {
          name: 'lpMint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 108, 112, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'poolState';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpSwapProgram';
            };
          };
        },
        {
          name: 'creatorLpToken';
          writable: true;
        },
        {
          name: 'token0Vault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: 'account';
                path: 'poolState';
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpSwapProgram';
            };
          };
        },
        {
          name: 'token1Vault';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 111, 111, 108, 95, 118, 97, 117, 108, 116];
              },
              {
                kind: 'account';
                path: 'poolState';
              },
              {
                kind: 'account';
                path: 'buyTokenMint';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpSwapProgram';
            };
          };
        },
        {
          name: 'createPoolFee';
          writable: true;
          address: 'G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2';
        },
        {
          name: 'observationState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [111, 98, 115, 101, 114, 118, 97, 116, 105, 111, 110];
              },
              {
                kind: 'account';
                path: 'poolState';
              },
            ];
            program: {
              kind: 'account';
              path: 'cpSwapProgram';
            };
          };
        },
        {
          name: 'userPurchase';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 112, 117, 114, 99, 104, 97, 115, 101];
              },
              {
                kind: 'account';
                path: 'buyer';
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'token0Program';
          docs: ['Spl token program or token program 2022'];
        },
        {
          name: 'token1Program';
          docs: ['Spl token program or token program 2022'];
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'openTime';
          type: 'u64';
        },
      ];
    },
    {
      name: 'initSaleAccount';
      discriminator: [148, 179, 197, 25, 167, 211, 122, 89];
      accounts: [
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
          };
        },
        {
          name: 'pdaAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
            ];
          };
        },
        {
          name: 'tokenMint';
        },
        {
          name: 'buyTokenMint';
        },
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'ownerTokenAccount';
          writable: true;
        },
        {
          name: 'saleTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'pdaAccount';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [
        {
          name: 'saleAmount';
          type: 'u64';
        },
        {
          name: 'pricePerToken';
          type: 'u64';
        },
        {
          name: 'endTime';
          type: 'i64';
        },
      ];
    },
    {
      name: 'withdrawSaleTokens';
      discriminator: [35, 95, 97, 226, 80, 75, 131, 53];
      accounts: [
        {
          name: 'sale';
          docs: [
            '销售账户',
            '验证：',
            '1. 销售必须处于活跃状态',
            '2. 调用者必须是销售账户的所有者',
          ];
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
          };
        },
        {
          name: 'pdaAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
            ];
          };
        },
        {
          name: 'tokenMint';
          docs: ['销售代币的Mint账户', '验证：必须与销售账户中记录的代币Mint一致'];
          writable: true;
        },
        {
          name: 'buyTokenMint';
          docs: ['购买代币的Mint账户', '验证：必须与销售账户中记录的购买代币Mint一致'];
          writable: true;
        },
        {
          name: 'owner';
          docs: ['销售账户所有者', '必须是交易的签名者'];
          writable: true;
          signer: true;
        },
        {
          name: 'ownerTokenAccount';
          docs: [
            '所有者的代币账户',
            '验证：',
            '1. 账户所有者必须是销售账户所有者',
            '2. 代币类型必须与销售代币一致',
          ];
          writable: true;
        },
        {
          name: 'saleTokenAccount';
          docs: [
            '销售账户的代币账户',
            '验证：',
            '1. 账户所有者必须是销售账户',
            '2. 代币类型必须与销售代币一致',
          ];
          writable: true;
        },
        {
          name: 'ownerBuyTokenAccount';
          docs: [
            '所有者的购买代币账户',
            '验证：',
            '1. 账户所有者必须是销售账户所有者',
            '2. 代币类型必须与购买代币一致',
          ];
          writable: true;
        },
        {
          name: 'contractTokenAccount';
          docs: [
            '合约的购买代币账户',
            '验证：',
            '1. 账户所有者必须是销售账户',
            '2. 代币类型必须与购买代币一致',
          ];
          writable: true;
        },
        {
          name: 'systemProgram';
          docs: ['系统程序'];
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          docs: ['代币程序'];
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          docs: ['关联代币程序'];
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [];
    },
    {
      name: 'withdrawTokens';
      discriminator: [2, 4, 225, 61, 19, 182, 106, 170];
      accounts: [
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
          };
        },
        {
          name: 'pdaAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 97, 108, 101];
              },
            ];
          };
        },
        {
          name: 'tokenMint';
          writable: true;
        },
        {
          name: 'buyTokenMint';
          writable: true;
        },
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'ownerTokenAccount';
          writable: true;
        },
        {
          name: 'saleTokenAccount';
          writable: true;
        },
        {
          name: 'refundTokenAccount';
          writable: true;
        },
        {
          name: 'contractTokenAccount';
          writable: true;
        },
        {
          name: 'userPurchase';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 112, 117, 114, 99, 104, 97, 115, 101];
              },
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'account';
                path: 'tokenMint';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'ammConfig';
      discriminator: [218, 244, 33, 104, 203, 203, 43, 111];
    },
    {
      name: 'saleAccount';
      discriminator: [213, 18, 87, 228, 218, 230, 207, 182];
    },
    {
      name: 'userPurchase';
      discriminator: [23, 17, 96, 83, 125, 230, 223, 233];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'pdaAccountIsNotMatch';
      msg: 'The PDA account does not match.';
    },
    {
      code: 6001;
      name: 'saleAmountTooLow';
      msg: 'Sale amount is too low.';
    },
    {
      code: 6002;
      name: 'insufficientBalance';
      msg: 'Insufficient balance.';
    },
    {
      code: 6003;
      name: 'saleNotActive';
      msg: 'Sale not active.';
    },
    {
      code: 6004;
      name: 'saleEnded';
      msg: 'Sale ended.';
    },
    {
      code: 6005;
      name: 'insufficientTokens';
      msg: 'Insufficient tokens.';
    },
    {
      code: 6006;
      name: 'calculationError';
      msg: 'Calculation error.';
    },
    {
      code: 6007;
      name: 'saleNotEnded';
      msg: 'Sale not ended.';
    },
    {
      code: 6008;
      name: 'noTokensToWithdraw';
      msg: 'No tokens to withdraw.';
    },
    {
      code: 6009;
      name: 'unauthorized';
      msg: 'Unauthorized.';
    },
    {
      code: 6010;
      name: 'invalidPrice';
      msg: 'Invalid price.';
    },
    {
      code: 6011;
      name: 'invalidEndTime';
      msg: 'Invalid end time.';
    },
    {
      code: 6012;
      name: 'saleAmountTooHigh';
      msg: 'Sale amount is too high.';
    },
    {
      code: 6013;
      name: 'amountTooSmall';
      msg: 'Amount too small.';
    },
    {
      code: 6014;
      name: 'overflow';
      msg: 'Overflow.';
    },
    {
      code: 6015;
      name: 'noTokensLeft';
      msg: 'No tokens left for sale.';
    },
    {
      code: 6016;
      name: 'balanceMismatch';
      msg: 'Token balance mismatch.';
    },
    {
      code: 6017;
      name: 'tokenMintMismatch';
      msg: 'Token mint mismatch.';
    },
    {
      code: 6018;
      name: 'tokenAccountMismatch';
      msg: 'Token account mismatch.';
    },
    {
      code: 6019;
      name: 'userAlreadyPurchased';
      msg: 'User already purchased.';
    },
    {
      code: 6020;
      name: 'userNotPurchased';
      msg: 'User not purchased.';
    },
    {
      code: 6021;
      name: 'missingRequiredSignature';
      msg: 'MissingRequiredSignature.';
    },
  ];
  types: [
    {
      name: 'ammConfig';
      docs: ['Holds the current owner of the factory'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            docs: ['Bump to identify PDA'];
            type: 'u8';
          },
          {
            name: 'disableCreatePool';
            docs: ['Status to control if new pool can be create'];
            type: 'bool';
          },
          {
            name: 'index';
            docs: ['Config index'];
            type: 'u16';
          },
          {
            name: 'tradeFeeRate';
            docs: ['The trade fee, denominated in hundredths of a bip (10^-6)'];
            type: 'u64';
          },
          {
            name: 'protocolFeeRate';
            docs: ['The protocol fee'];
            type: 'u64';
          },
          {
            name: 'fundFeeRate';
            docs: ['The fund fee, denominated in hundredths of a bip (10^-6)'];
            type: 'u64';
          },
          {
            name: 'createPoolFee';
            docs: ['Fee for create a new pool'];
            type: 'u64';
          },
          {
            name: 'protocolOwner';
            docs: ['Address of the protocol fee owner'];
            type: 'pubkey';
          },
          {
            name: 'fundOwner';
            docs: ['Address of the fund fee owner'];
            type: 'pubkey';
          },
          {
            name: 'padding';
            docs: ['padding'];
            type: {
              array: ['u64', 16];
            };
          },
        ];
      };
    },
    {
      name: 'saleAccount';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'tokenMint';
            type: 'pubkey';
          },
          {
            name: 'saleAmount';
            type: 'u64';
          },
          {
            name: 'remainingAmount';
            type: 'u64';
          },
          {
            name: 'pricePerToken';
            type: 'u64';
          },
          {
            name: 'buyTokenMint';
            type: 'pubkey';
          },
          {
            name: 'endTime';
            type: 'i64';
          },
          {
            name: 'isActive';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'userPurchase';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'userAddress';
            type: 'pubkey';
          },
          {
            name: 'tokenAmount';
            type: 'u64';
          },
          {
            name: 'tokenPrice';
            type: 'u64';
          },
          {
            name: 'tokenAddress';
            type: 'pubkey';
          },
          {
            name: 'purchaseAmount';
            type: 'u64';
          },
          {
            name: 'purchaseTime';
            type: 'i64';
          },
          {
            name: 'isClaim';
            type: 'bool';
          },
        ];
      };
    },
  ];
};
