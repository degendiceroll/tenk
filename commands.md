# Commands

```sh
# Upload assets

ts-node scripts/nft-uploader-launch.ts

# Running Codes

yarn test # Running all tests
yarn test --help # To get help
yarn test __test__/nft.ava.ts # Runnings tests in specific file
yarn test __test__/nft.ava.ts -c 1 -v # concurrency is 1 and verbose mode

# Running tests related to NFT mints
yarn test __test__/nft.ava.ts -c 1 -v
# Running tests related to Paras
yarn test __test__/paras.ava.ts -c 1 -v
# Running tests related to Dragon
yarn test __test__/dragon.ava.ts -c 1 -v


# RPC Calls

near deploy --wasmFile target/wasm32-unknown-unknown/release/tenk.wasm --accountId flyingsaucertenk.testnet

near call flyingsaucertenk.testnet new_default_meta --accountId flyingsaucertenk.testnet '{"owner_id": "flyingsaucertenk.testnet", "name": "NDN", "symbol": "NDN", "uri": "https://pixabay.com/images/", "size": 10, "base_cost": "1", "min_cost": "1"}'

near call flyingsaucertenk.testnet total_cost --accountId flyingsaucertenk.testnet '{"num": 1, "minter": "flyingsaucertenk.testnet"}'
near call flyingsaucertenk.testnet total_cost --accountId flyingsaucertenk.testnet '{"num": 1, "minter": "flyingsaucer00.testnet"}'

near call flyingsaucertenk.testnet nft_mint_one --accountId flyingsaucertenk.testnet --deposit '0.01523'
```
