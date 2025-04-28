import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { IStakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import { pool, getCoins, returnMergedCoins, depositCoin } from "navi-sdk";
import type { Pool, PoolConfig } from "navi-sdk/dist/types";
import { handleFormatSymbol } from "./utils";
/**
 * Stake token into Navi
 * @param agent - SuiAgentKit instance
 * @param params - IStakingParams
 * @returns Promise resolving to the transaction hash
 */
export async function staking_navi(
  agent: SuiAgentKit,
  params: IStakingParams,
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
    throw new Error(`Failed to stake token into Navi: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: IStakingParams,
): Promise<Transaction> => {
  try {
    const transaction = new Transaction();

    let amount = Number(params.amount);
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!params?.tokenAddress) {
      throw new Error("Token address is required");
    }

    // check balance
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

    const poolConfigStake: PoolConfig =
      pool[handleFormatSymbol(params?.symbol) as keyof Pool];

    const coinInfo = await getCoins(
      agent.client as any,
      agent.wallet_address,
      params.tokenAddress,
    );

    if (!coinInfo?.data?.[0]) {
      throw new Error(`Insufficient balance for ${params.symbol}`);
    }

    if (poolConfigStake) {
      if (handleFormatSymbol(params?.symbol) === "Sui") {
        const toDepositStake = transaction.splitCoins(transaction.gas, [
          amount,
        ]);
        await depositCoin(transaction, poolConfigStake, toDepositStake, amount);
      } else {
        const mergedCoinObject = returnMergedCoins(transaction, coinInfo);
        await depositCoin(
          transaction,
          poolConfigStake,
          mergedCoinObject,
          amount,
        );
      }
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
