# Pump

## environment

```shell
# use specified version of node https://github.com/nvm-sh/nvm
nvm use
# install dependencies
pnpm i
# dev
pnpm run serve
# build
pnpm run build
# lint
pnpm run lint
# deploy
pnpm run deploy
```

##

1. 需要先创建一个 token 作为 usdtMint，将 src/web3/index.ts 40 行改为创建的 usdtMint
2. 调用 buyTokens 如果失败，需要往 src/web3/index.ts 372 行打印的 pda 地址打 1 个 SOL
