import dayjs from "dayjs";
import { NEAR } from "near-units";
import { Workspace } from "near-willem-workspaces-ava";
import { createNewAccount, userMintsNFTs } from "./dragon_utils";
import { deploy, getTokens, sleep } from "./util";

const sale_price = NEAR.parse("5 N");

const runner = Workspace.init(
  { initialBalance: NEAR.parse("20 N").toString() },
  async ({ root }) => {
    const alice = await createNewAccount(console, root, "alice", "100 N");
    const epochNext20sec = dayjs().unix() + 20;
    const epochNext60sec = dayjs().unix() + 60;
    const tenk = await deploy(root, "tenk", {
      is_premint_over: false,
      base_cost: sale_price,
      min_cost: sale_price,
      premint_start_epoch: epochNext20sec,
      mint_start_epoch: epochNext60sec,
    });
    return { tenk, alice };
  }
);

runner.test("premint", async (t, { root, tenk, alice }) => {
  // Owner mints one before presale
  await userMintsNFTs(t, root, tenk, 1);
  // Alice's mint fails before presale
  await userMintsNFTs(t, alice, tenk, 1, true);
  // Wait for presale to start
  const presaleTimer = await sleep(1000 * 20);
  await presaleTimer;
  // Alice's mint fails during presale since she isn't whitelisted
  await userMintsNFTs(t, alice, tenk, 1, true);
  // Whitelist alice to mint 2 NFTs
  await root.call(tenk, "add_whitelist_account", {
    account_id: alice,
    allowance: 2,
  });
  // Alice mint 2 NFTs successfully and mint of 3rd one fails
  await userMintsNFTs(t, alice, tenk, 2, false);
  await userMintsNFTs(t, alice, tenk, 1, true);
  // Alice waits for the sale to start
  const saleTimer = await sleep(1000 * 40);
  await saleTimer;
  // Alice mints 3rd NFT successfully
  await userMintsNFTs(t, alice, tenk, 1, false);

  // Alice finally has 3 NFTs
  const tokens = await getTokens(tenk, alice);
  t.assert(tokens.length == 3);
});
