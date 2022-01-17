import { Workspace, NEAR, Gas } from "near-willem-workspaces";
import dayjs from "dayjs";

import { CONTRACT_PATH } from "../__test__/util/bin";
// import { NearAccount } from "near-willem-workspaces-ava";

const network = "testnet";
const sale_price = NEAR.parse("5 N");

// export async function deployEmpty(account: NearAccount): Promise<void> {
//   const empty = account.getFullAccount("emptyaccount.testnet");
//   const accountView = await empty.accountView();
//   const emptyAccountCodeHash = accountView.code_hash;
//   console.log({ emptyAccountCodeHash });
//   // const bytes = await empty.viewCode();
//   // console.log({ bytes });
//   await account
//     .createTransaction(account)
//     .deployContract(new Uint8Array(0))
//     .signAndSend();
// }

void Workspace.open(
  { network, rootAccount: "app7.flyingsaucertenk.testnet" },
  async ({ root }) => {
    const rootBalance = await root.availableBalance();

    console.log({
      rootBalance: rootBalance.toHuman(),
      rootId: root.accountId,
      CONTRACT_PATH,
    });

    const royalties = {
      accounts: {
        "flyingsaucertenk.testnet": 40,
        "flyingsaucer00.testnet": 40,
        "emptyaccount.testnet": 10,
        "dragonnation.testnet": 10,
      },
      percent: 20,
    };

    const initial_royalties = {
      accounts: {
        "flyingsaucertenk.testnet": 40,
        "flyingsaucer00.testnet": 40,
        "emptyaccount.testnet": 10,
        "dragonnation.testnet": 10,
      },
      percent: 100,
    };

    const epochNext060sec = dayjs().unix() + 60;
    const epochNext300sec = dayjs().unix() + 300;

    console.log({ epochNext060sec, epochNext300sec });

    const accountView = await root.accountView();
    const owner_id = root.accountId;
    console.log({ owner_id }, accountView.code_hash);

    // // Put down the contract
    // await deployEmpty(root);
    // return;

    if (accountView.code_hash == "11111111111111111111111111111111") {
      let tx = await root
        .createTransaction(root)
        .deployContractFile(CONTRACT_PATH);
      await tx
        .functionCall(
          "new_default_meta",
          {
            owner_id,
            name: "Near Dragon Nation",
            symbol: "NDN",
            uri: "https://bafybeidq7nu5pxsiy2cext6qtxxygpifhunxco25mtrabfge2rf6lxdax4.ipfs.dweb.link/",
            description:
              "Dragon Nation is an exclusive collection of 3,000 Dragon NFTs on the NEAR blockchain.",
            size: 3000,
            base_cost: sale_price,
            min_cost: sale_price,
            royalties,
            initial_royalties,
            premint_start_epoch: epochNext060sec,
            mint_start_epoch: epochNext300sec,
          },
          {
            gas: Gas.parse("20 TGas"),
          }
        )
        .functionCall(
          "add_whitelist_account",
          {
            account_id: "flyingsaucer00.testnet",
            allowance: 2,
          },
          {
            gas: Gas.parse("20 TGas"),
          }
        )
        .signAndSend();
    } else {
      console.log("Program is already deployed!!");
    }
  }
);
