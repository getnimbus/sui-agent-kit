import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { ILendingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import {
  poolIdPoolNameMap,
  depositSingleAssetTxb,
  depositDoubleAssetTxb,
} from "@alphafi/alphafi-sdk";
import { getCoinMetadataInWallet } from "../../utils/get_coinmetadata_in_wallet";
/**
 * Lend token into Alphafi
 * @param agent - SuiAgentKit instance
 * @param params - ILendingParams
 * @returns Promise resolving to the transaction hash
 */
export async function lending_alphafi(
  agent: SuiAgentKit,
  params: ILendingParams,
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
    throw new Error(`Failed to lend token into Alphafi: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: ILendingParams,
): Promise<Transaction> => {
  try {
    const coinMetadata = await getCoinMetadataInWallet(agent, params.symbol);

    if (!coinMetadata) {
      throw new Error(
        `Your wallet doesn't have ${params.symbol} token, please transfer ${params.symbol} token to your wallet`,
      );
    }

    const amount = Number(params.amount) * 10 ** (coinMetadata?.decimals || 0);
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!params?.poolId) {
      throw new Error("Pool ID is required");
    }

    const poolName = poolIdPoolNameMap[params?.poolId];

    if (!poolName) {
      throw new Error("Pool not support lending");
    }

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

    let transaction;
    if (params?.isSinglePool && Boolean(params?.isSinglePool)) {
      transaction = await depositSingleAssetTxb(
        poolName,
        agent.wallet_address,
        amount.toString(),
      );
    } else {
      transaction = await depositDoubleAssetTxb(
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
