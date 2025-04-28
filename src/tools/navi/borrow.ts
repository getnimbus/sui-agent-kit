import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IBorrowParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { pool, borrowCoin } from "navi-sdk";
import type { Pool, PoolConfig } from "navi-sdk/dist/types";
import { handleFormatSymbol } from "./utils";

/**
 * Borrow token from Navi
 * @param agent - SuiAgentKit instance
 * @param params - IBorrowParams
 * @returns Promise resolving to the transaction hash
 */
export async function borrow_navi(
  agent: SuiAgentKit,
  params: IBorrowParams,
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
    throw new Error(`Failed to unstake token from Navi: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: IBorrowParams,
): Promise<Transaction> => {
  try {
    const transaction = new Transaction();
    let amount = Number(params.amount);

    // TODO: update not remove hardcode decimal cause we support all token
    amount = Number(params.amount) * 10 ** 9;

    const poolConfigBorrow: PoolConfig =
      pool[handleFormatSymbol(params?.collateral) as keyof Pool];

    const coinsDataBorrow = await borrowCoin(
      transaction,
      poolConfigBorrow,
      amount,
    );
    transaction.transferObjects(coinsDataBorrow, agent.wallet_address);

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
