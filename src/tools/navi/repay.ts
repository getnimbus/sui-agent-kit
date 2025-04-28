import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IRepayParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { pool, getCoins, returnMergedCoins, repayDebt } from "navi-sdk";
import type { Pool, PoolConfig } from "navi-sdk/dist/types";
import { handleFormatSymbol } from "./utils";
import { get_holding } from "../sui/token/get_balance";

/**
 * Repay token from Navi
 * @param agent - SuiAgentKit instance
 * @param params - IRepayParams
 * @returns Promise resolving to the transaction hash
 */
export async function repay_navi(
  agent: SuiAgentKit,
  params: IRepayParams,
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
  params: IRepayParams,
): Promise<Transaction> => {
  try {
    const transaction = new Transaction();
    let amount = Number(params.amount);

    // check balance for GAS FEE
    const balancesMetadata = await get_holding(agent);

    const nativeToken = balancesMetadata.find(
      (r) => r.address === "0x2::sui::SUI",
    );

    if (
      Number(nativeToken?.balance) <= 1 ||
      Number(nativeToken?.balance) < amount
    ) {
      throw new Error("Insufficient SUI native balance");
    }

    // TODO: update not remove hardcode decimal cause we support all token
    amount = Number(params.amount) * 10 ** 9;

    const poolConfigRepay: PoolConfig =
      pool[handleFormatSymbol(params?.collateral) as keyof Pool];

    if (handleFormatSymbol(params?.collateral) === "Sui") {
      const toDepositRepay = transaction.splitCoins(transaction.gas, [amount]);

      await repayDebt(transaction, poolConfigRepay, toDepositRepay, amount);
    } else {
      const coinInfoRepay = await getCoins(
        agent.client as any,
        agent.wallet_address,
        params.tokenAddress,
      );
      const mergedCoinObject = returnMergedCoins(transaction, coinInfoRepay);
      await repayDebt(transaction, poolConfigRepay, mergedCoinObject, amount);
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
