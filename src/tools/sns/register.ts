import { SuinsClient, SuinsTransaction } from "@mysten/suins";
import { SuiAgentKit } from "../../index";
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
) {
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
  // const priceInfoObjectId = await agent.client.getPriceInfoObject(
  //   transaction,
  //   coinConfig.feed,
  // )[0];
  // // Build the transaction to register the name, specifying a year from 1 to 5.
  // const nft = suinsTransaction.register({
  //   domain: "myname.sui",
  //   years: 3,
  //   coinConfig,
  //   priceInfoObjectId, // Only required for SUI/NS
  // });
  // Transfer the name's NFT
  // transaction.transferObjects(
  //   [nft],
  //   transaction.pure.address(agent.wallet_address),
  // );
}
