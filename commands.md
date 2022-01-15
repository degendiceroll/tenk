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

near deploy --wasmFile target/wasm32-unknown-unknown/release/tenk.wasm --accountId ndnflying.testnet

near call ndnflying.testnet new_default_meta --accountId ndnflying.testnet '{"owner_id": "flyingsaucertenk.testnet", "name": "Near Dragon Nation", "symbol": "NDN", "uri": "https://bafybeigulzte3aqfco5fmh6hxq7ul7qhdpguecx4aogoq4ejxp3w3cupdm.ipfs.dweb.link/", "size": 13, "base_cost": "5000000000000000000000000", "min_cost": "5000000000000000000000000", "mint_start_epoch": 1642271157, "royalties": {"accounts": {"flyingsaucertenk.testnet": 50, "flyingsaucer00.testnet": 50}, "percent": 20}}'

near call ndnflying.testnet tokens_left --accountId flyingsaucertenk.testnet

near call ndnflying.testnet get_mint_start_epoch --accountId ndnflying.testnet
near call ndnflying.testnet update_mint_start_epoch --accountId flyingsaucertenk.testnet '{"mint_start_epoch": 1642275661}'

near call flyingsaucertenk.testnet total_cost --accountId flyingsaucertenk.testnet '{"num": 1, "minter": "flyingsaucertenk.testnet"}'
near call flyingsaucertenk.testnet total_cost --accountId flyingsaucertenk.testnet '{"num": 1, "minter": "flyingsaucer00.testnet"}'

near call flyingsaucertenk.testnet nft_mint_one --accountId flyingsaucertenk.testnet --deposit '0.01523'

near state flyingsaucertenk.testnet
```
