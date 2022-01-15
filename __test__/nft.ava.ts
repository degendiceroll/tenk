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

const base_cost = NEAR.parse("1 N");
const min_cost = NEAR.parse("0.01 N");

const createNewAccout = async (
  root: NearAccount,
  accountName: string,
  initialBalance: string = "15 N"
) => {
  const account = await root.createAccount(accountName, {
    initialBalance: NEAR.parse(initialBalance).toString(),
  });
  const accountAddress = account.accountId;
  const accountBalance = await account.balance();
  const accountBalanceHuman = accountBalance.available.toHuman();
  console.log(`${accountAddress} created with balance ${accountBalanceHuman}`);
  return account;
};

const runner = Workspace.init(
  { initialBalance: NEAR.parse("15 N").toString() },
  async ({ root }) => {
    console.log(`Is testnet? ${Workspace.networkIsTestnet()}`);
    // root will be test.near
    const rootBalance = await root.balance();
    const rootBalanceHuman = rootBalance.available.toHuman();
    console.log({ rootBalanceHuman });
    const alice = await createNewAccout(root, "alice", "50 N");
    const bob = await createNewAccout(root, "bob", "15 N");
    // the contract will be deployed on tenk.test.near
    // and new_default_meta function is being called to initialize it
    const tenk = await deploy(root, "tenk", { base_cost, min_cost });
    return { tenk, alice, bob };
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
    t.assert(cost.gt(await costPerToken(tenk, 24)));
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

async function userMintsNFTs(t, user: NearAccount, tenk, num) {
  const method = num == 1 ? "nft_mint_one" : "nft_mint_many";
  let args = num == 1 ? {} : { num };
  const cost = await totalCost(tenk, num);

  t.log(
    `${user.accountId} is minting: ${num} tokens costing ` + cost.toHuman()
  );
  const userBalanceBefore = (await user.balance()).available.toHuman();
  t.log(`Balance Before: ${userBalanceBefore}`);
  const res = await user.call_raw(tenk, method, args, {
    attachedDeposit: cost,
    gas: MINT_ONE_GAS,
  });
  t.true(res.succeeded, [res.Failure, ...res.promiseErrorMessages].join("\n"));
  const userBalanceAfter = (await user.balance()).available.toHuman();
  t.log(`Balance After: ${userBalanceAfter}`);
  t.is(num, (await nftTokensForOwner(user, tenk)).length);
  if (num == 30 && Workspace.networkIsTestnet()) {
    await deployEmpty(tenk);
  }
}

[
  ["one", 1],
  ["two", 2],
  ["ten", 10],
].forEach(async ([num, x]) => {
  runner.test("alice mints " + num, async (t, { alice, tenk }) => {
    await userMintsNFTs(t, alice, tenk, x);
  });
});
