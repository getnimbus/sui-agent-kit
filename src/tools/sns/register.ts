import { SuinsClient, SuinsTransaction } from "@mysten/suins";
import { SuiAgentKit, TransactionResponse } from "../../index";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";

/**
 * Get the holdings asset of SUI token for the agent's wallet
 * @param agent - SuiAgentKit instance
 * @returns Promise resolving to the holdings as array of TokenBalance or null if account doesn't exist
 */
export async function register_sns(
  agent: SuiAgentKit,
  name: string,
  years: number,
  payToken: string,
): Promise<TransactionResponse> {
  try {
    const suinsClient = new SuinsClient({
      client: agent.client,
      network: "mainnet",
    });

    const tx = new Transaction();

    const coinConfig = suinsClient.config.coins.SUI; // Specify the coin type used for the transaction
    const priceInfoObjectId =
      coinConfig !== suinsClient.config.coins.USDC
        ? (await suinsClient.getPriceInfoObject(tx, coinConfig.feed))[0]
        : null;

    const suinsTx = new SuinsTransaction(suinsClient, tx);

    const uniqueName =
      (
        Date.now().toString(36) + Math.random().toString(36).substring(2)
      ).repeat(2) + ".sui";

    const [coinInput] = suinsTx.transaction.splitCoins(
      suinsTx.transaction.gas,
      [5n * MIST_PER_SUI],
    );

    const nft = suinsTx.register({
      domain: uniqueName,
      years: 1,
      coinConfig: suinsClient.config.coins.SUI,
      coin: coinInput,
      priceInfoObjectId,
    });

    // Sets the target address of the NFT.
    suinsTx.setTargetAddress({
      nft,
      address: agent.wallet_address,
      isSubname: false,
    });

    /* Optionally transfer the NFT */
    // suinsTx.transaction.transferObjects([nft], "0xMyAddress");

    tx.setSender(agent.wallet_address);
    tx.setGasBudget(10 * 10 ** 9); // TODO: remove this in production, only use for dry run

    const res = await agent.client.dryRunTransactionBlock({
      transactionBlock: await tx.build({
        client: agent.client,
      }),
    });

    console.log(res);

    // execute the transaction
    // const txExec = await agent.client.signAndExecuteTransaction({
    //   signer: agent.wallet,
    //   transaction: tx,
    // });

    // // wait for the transaction to be executed
    // const res = await agent.client.waitForTransaction({
    //   digest: txExec.digest,
    //   options: {
    //     showEffects: true,
    //   },
    // });

    return {
      // tx_hash: txExec.digest,
      // tx_status: res.effects?.status.status || "unknown",
      tx_hash: "",
      tx_status: "unknown",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
