import { SuinsClient, SuinsTransaction } from "@mysten/suins";
import { SuiAgentKit, TransactionResponse } from "../../index";
import { Transaction } from "@mysten/sui/transactions";

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
    // const suinsClient = new SuinsClient({
    //   client: agent.client,
    //   network: "mainnet",
    // });
    // // Create a transaction block as usual in your PTBs.
    // const transaction = new Transaction();
    // // Pass in the transaction block & the app's global SuinsClient.
    // const suinsTransaction = new SuinsTransaction(suinsClient, transaction);
    // // Specify the coin type used for the transaction, can be SUI/NS/USDC
    // const coinConfig = suinsClient.config.coins.USDC;
    // // priceInfoObjectId is required for SUI/NS
    // const priceInfoObjectId = await suinsClient
    //   .getPriceInfoObject(transaction, coinConfig.feed)
    //   .then((res) => res[0]);
    // // Build the transaction to register the name, specifying a year from 1 to 5.
    // const nft = suinsTransaction.register({
    //   domain: name,
    //   years: years,
    //   coinConfig,
    //   priceInfoObjectId, // Only required for SUI/NS
    // });
    // // Transfer the name's NFT
    // transaction.transferObjects(
    //   [nft],
    //   transaction.pure.address(agent.wallet_address),
    // );

    // // execute the transaction
    // const txExec = await agent.client.signAndExecuteTransaction({
    //   signer: agent.wallet,
    //   transaction: transaction,
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
