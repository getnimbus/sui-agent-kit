import { SuinsClient, SuinsTransaction } from "@mysten/suins";
import { SuiAgentKit, TransactionResponse } from "../../index";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import logger from "../../utils/logger";

/**
 * Register a Sui Name Service (SNS) domain
 * @param agent - SuiAgentKit instance
 * @param name - The domain name to register (without .sui suffix)
 * @param years - Number of years to register for
 * @param payToken - Token symbol to pay with ("SUI", "USDC", "USDT")
 * @returns Promise resolving to the transaction response
 */
export async function register_sns(
  agent: SuiAgentKit,
  name: string,
  years: number,
  payToken: "SUI" | "USDC" | "NS",
): Promise<TransactionResponse> {
  try {
    const suinsClient = new SuinsClient({
      client: agent.client as any,
      network: "mainnet",
    });

    const tx = new Transaction();

    if (!["SUI", "USDC", "NS"].includes(payToken)) {
      throw new Error("Invalid payToken");
    }
    const coinConfig = suinsClient.config.coins[payToken]; // Specify the coin type used for the transaction

    const priceInfoObjectId =
      coinConfig !== suinsClient.config.coins.USDC
        ? (await suinsClient.getPriceInfoObject(tx as any, coinConfig.feed))[0]
        : null;

    const suinsTx = new SuinsTransaction(suinsClient, tx as any);

    const [coinInput] = suinsTx.transaction.splitCoins(
      suinsTx.transaction.gas,
      [5n * MIST_PER_SUI],
    );

    const nft = suinsTx.register({
      domain: name + ".sui",
      years: years,
      coinConfig: coinConfig,
      coin: coinInput,
      priceInfoObjectId,
    });

    // Sets the target address of the NFT.
    suinsTx.setTargetAddress({
      nft,
      address: agent.wallet_address,
      isSubname: false,
    });

    // Transfer the NFT to the main's wallet
    suinsTx.transaction.transferObjects([nft], agent.wallet_address);

    tx.setSender(agent.wallet_address);

    // execute the transaction
    const txExec = await agent.client.signAndExecuteTransaction({
      signer: agent.wallet,
      transaction: tx,
    });

    // wait for the transaction to be executed
    const res = await agent.client.waitForTransaction({
      digest: txExec.digest,
      options: {
        showEffects: true,
      },
    });

    return {
      tx_hash: txExec.digest,
      tx_status: res.effects?.status.status || "unknown",
    };
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to register SNS: ${error.message}`);
  }
}
