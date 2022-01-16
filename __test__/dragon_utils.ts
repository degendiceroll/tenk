import { NEAR } from "near-units";
import { NearAccount } from "near-willem-workspaces-ava";
import { MINT_ONE_GAS, nftTokensForOwner, totalCost } from "./util";

export const createNewAccount = async (
  t: any,
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
  t.log(`${accountAddress} created with balance ${accountBalanceHuman}`);
  return account;
};

export const printBalance = async (t, user: NearAccount) => {
  const userAddress = user.accountId;
  const userBalance = await user.balance();
  const userBalanceHuman = userBalance.available.toHuman();
  t.log(`${userAddress} has ${userBalanceHuman}`);
};

export async function userMintsNFTs(
  t,
  user: NearAccount,
  tenk,
  num,
  shouldFail: boolean = false,
  printRootCost: boolean = false
) {
  const numPriorHoldings = (await nftTokensForOwner(user, tenk)).length;
  const method = num == 1 ? "nft_mint_one" : "nft_mint_many";
  let args = num == 1 ? {} : { num };
  const cost = await totalCost(tenk, num, user.accountId);

  if (printRootCost) {
    t.log(
      "Cost for root to mint",
      (await totalCost(tenk, num, "test.near")).toHuman()
    );
  }

  t.log(
    `${user.accountId} is minting: ${num} tokens costing ` + cost.toHuman()
  );
  const userBalanceBefore = (await user.balance()).available.toHuman();
  t.log(`Balance Before: ${userBalanceBefore}`);
  const res = await user.call_raw(tenk, method, args, {
    attachedDeposit: cost,
    gas: MINT_ONE_GAS,
  });
  if (shouldFail) {
    t.assert(res.failed);
    t.is(numPriorHoldings, (await nftTokensForOwner(user, tenk)).length);
  } else {
    t.true(
      res.succeeded,
      [res.Failure, ...res.promiseErrorMessages].join("\n")
    );
    t.is(num, (await nftTokensForOwner(user, tenk)).length - numPriorHoldings);
  }
  const userBalanceAfter = (await user.balance()).available.toHuman();
  t.log(`Balance After: ${userBalanceAfter}`);
}
