import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IUnstakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import { poolIdPoolNameMap, withdrawTxb } from "@alphafi/alphafi-sdk";

/**
 * Unstake token from Alphafi
 * @param agent - SuiAgentKit instance
 * @param params - IUnstakingParams
 * @returns Promise resolving to the transaction hash
 */
export async function unstake_alphafi(
  agent: SuiAgentKit,
  params: IUnstakingParams,
): Promise<TransactionResponse> {
  try {
    const client = agent.client;

    const tx = await getTransactionPayload(agent, params);

    const txExec = await client.signAndExecuteTransaction({
      signer: agent.wallet,
      transaction: tx,
    });

    // wait for the transaction to be executed
    const res = await client.waitForTransaction({
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
    throw new Error(`Failed to unstake token from Alphafi: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: IUnstakingParams,
): Promise<Transaction> => {
  try {
    const transaction = new Transaction();
    let amount = Number(params.amount);

    // get metadata
    const balancesMetadata = await get_holding(agent);

    const tokenData = balancesMetadata.find(
      (r) => r.symbol.toLowerCase() === params.symbol.toLowerCase(),
    );

    if (!tokenData) {
      throw new Error("Token not found in your wallet");
    }

    amount = Number(params.amount) * 10 ** (tokenData?.decimals || 9);

    if (!params?.positionId) {
      throw new Error("Position ID is required");
    }

    const poolName = poolIdPoolNameMap[params?.positionId];

    await withdrawTxb(amount.toString(), poolName, agent.wallet_address);

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
