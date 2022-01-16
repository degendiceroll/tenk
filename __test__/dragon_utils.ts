import { NEAR } from "near-units";
import { NearAccount } from "near-willem-workspaces-ava";

export const createNewAccout = async (
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
