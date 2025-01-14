import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import {
  costPerToken,
  tokenStorageCost,
  totalCost,
  MINT_ONE_GAS,
  nftTokensForOwner,
  deployEmpty,
  deploy,
} from "./util";
import { createNewAccount, printBalance, userMintsNFTs } from "./dragon_utils";

const base_cost = NEAR.parse("5 N");
const min_cost = NEAR.parse("5 N");

function createRoyalties({ root, alice, bob, eve }) {
  return {
    accounts: {
      [root.accountId]: 10,
      [alice.accountId]: 10,
      [bob.accountId]: 10,
      [eve.accountId]: 70,
    },
    percent: 20,
  };
}

function subaccounts(root: NearAccount): Promise<NearAccount[]> {
  return Promise.all(
    ["bob", "alice", "eve"].map((n) =>
      root.createAccount(n, {
        initialBalance: NEAR.parse("200 N").toString(),
      })
    )
  );
}

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    console.log(`Is testnet? ${Workspace.networkIsTestnet()}`);

    const [bob, alice, eve] = await subaccounts(root);
    const royalties = createRoyalties({ root, bob, alice, eve });

    const ndnDefaultMetaArgs = {
      name: "Near Dragon Nation",
      symbol: "NFN",
      uri: "https://bafybeiehqz6vklvxkopg3un3avdtevch4cywuihgxrb4oio2qgxf4764bi.ipfs.dweb.link/",
      size: 100,
      mint_start_epoch: 1642264405,
      base_cost,
      min_cost,
      royalties,
    };

    // the contract will be deployed on tenk.eve.test.near
    // and new_default_meta function is being called to initialize it
    await printBalance(console, eve);
    const tenk = await deploy(eve, "tenk", ndnDefaultMetaArgs);
    await printBalance(console, eve);
    return { tenk, alice, bob, eve };
  }
);

runner.test("can get cost per token", async (t, { tenk }) => {
  const cost = await costPerToken(tenk, 1);
  const storageCost = await tokenStorageCost(tenk);
  t.log(
    "One token costs " +
      cost.toHuman() +
      "to buy and " +
      storageCost.toHuman() +
      " to store"
  );

  t.log(
    `Const per token for 24 is: ${await (
      await costPerToken(tenk, 24)
    ).toHuman()}`
  );

  t.deepEqual(cost.toBigInt(), base_cost.add(storageCost).toBigInt());
  if (cost.toBigInt() > 0) {
    t.assert(cost.gte(await costPerToken(tenk, 24)));
  }
});

async function assertXTokens(t, root: NearAccount, tenk, num) {
  const method = num == 1 ? "nft_mint_one" : "nft_mint_many";
  let args = num == 1 ? {} : { num };
  const cost = await totalCost(tenk, num);

  t.log(`${num} token costs ` + cost.toHuman());
  const res = await root.call_raw(tenk, method, args, {
    attachedDeposit: cost,
    gas: MINT_ONE_GAS,
  });
  t.true(res.succeeded, [res.Failure, ...res.promiseErrorMessages].join("\n"));
  t.is(num, (await nftTokensForOwner(root, tenk)).length);
  if (num == 30 && Workspace.networkIsTestnet()) {
    await deployEmpty(tenk);
  }
}

[
  ["one", 1],
  ["two", 2],
  ["five", 5],
  ["ten", 10],
  // ["thirty", 30],
].forEach(async ([num, x]) => {
  runner.test("mint " + num, async (t, { root, tenk }) => {
    await assertXTokens(t, root, tenk, x);
  });
});

[
  ["one", 1],
  ["two", 2],
  ["ten", 10],
].forEach(async ([num, x]) => {
  runner.test("alice mints " + num, async (t, { alice, tenk }) => {
    await userMintsNFTs(t, alice, tenk, x);
  });
});

async function getDetailedViewOfNFT(t, user: NearAccount, tenk) {
  await userMintsNFTs(t, user, tenk, 1);
  const nftList = await nftTokensForOwner(user, tenk);
  const singleNFTMetadata = nftList[0];
  t.log({ singleNFTMetadata });
  const collectionMetadata = await tenk.view("nft_metadata");
  t.log({ collectionMetadata });
}

runner.test("detailed view of NFT ", async (t, { bob, tenk }) => {
  await getDetailedViewOfNFT(t, bob, tenk);
});

async function mintingAllNFTs(
  t,
  root: NearAccount,
  deployer: NearAccount,
  tenk
) {
  const whale = await createNewAccount(t, root, "whale", "2000 N");
  for (let i = 0; i < 10; i++) {
    await userMintsNFTs(t, whale, tenk, 10);
    const tokens_left = await tenk.view("tokens_left");
    t.log(`Number of tokens left: ${tokens_left}`);
    await printBalance(t, deployer);
  }

  t.log(`Number of Holdings: ${(await nftTokensForOwner(whale, tenk)).length}`);

  const method = "nft_mint_one";
  const cost = await totalCost(tenk, 1, whale.accountId);

  await whale.call_raw(
    tenk,
    method,
    {},
    {
      attachedDeposit: cost,
      gas: MINT_ONE_GAS,
    }
  );
  t.is(100, (await nftTokensForOwner(whale, tenk)).length);

  const mintedNFTs = await nftTokensForOwner(whale, tenk);
  const tokenIdList = mintedNFTs
    .map((nft) => nft?.token_id)
    .sort((a, b) => parseInt(a) - parseInt(b));
  t.log({ tokenIdList });
}

runner.test("Try minting all NFTs", async (t, { root, eve, tenk }) => {
  await mintingAllNFTs(t, root, eve, tenk);
});
