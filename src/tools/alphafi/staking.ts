import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { IStakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import {
  poolIdPoolNameMap,
  depositSingleAssetTxb,
  depositDoubleAssetTxb,
} from "@alphafi/alphafi-sdk";
/**
 * Stake token into Alphafi
 * @param agent - SuiAgentKit instance
 * @param params - IStakingParams
 * @returns Promise resolving to the transaction hash
 */
export async function staking_alphafi(
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
    throw new Error(`Failed to stake token into Alphafi: ${error.message}`);
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

    if (!params?.poolId) {
      throw new Error("Pool ID is required");
    }

    const poolName = poolIdPoolNameMap[params?.poolId];

    if (!poolName) {
      throw new Error("Pool not support stake");
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

    if (params?.isSinglePool && Boolean(params?.isSinglePool)) {
      await depositSingleAssetTxb(
        poolName,
        agent.wallet_address,
        amount.toString(),
      );
    } else {
      await depositDoubleAssetTxb(
        poolName,
        agent.wallet_address,
        amount.toString(),
        false,
      );
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
