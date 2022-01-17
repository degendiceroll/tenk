import { Workspace } from "near-willem-workspaces";
import * as assert from "assert";

import { CONTRACT_PATH } from "../__test__/util/bin";

const network = "testnet";

const whitelist = [
  {
    account_id: "flyingsaucer00.testnet",
    allowance: 2,
  },
];

void Workspace.open(
  { network, rootAccount: "app7.flyingsaucertenk.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();

    console.log({
      rootBalance: rootBalance.toHuman(),
      rootId: root.accountId,
      CONTRACT_PATH,
    });

    for (const wlItem of whitelist) {
      await root.call(root, "add_whitelist_account", wlItem);
      const account_id = wlItem.account_id;
      const allowance = wlItem.allowance;
      const numWL = await root.view("get_wl_allowance", {
        account_id: account_id,
      });
      assert.ok(numWL === allowance);
      console.log(`${account_id} -> ${allowance}`);
    }
  }
);
