import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IStakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { listSpringSuiStaking } from "./util";
import { getSuilendSdkData } from "./util";
import { get_holding } from "../sui/token/get_balance";
/**
 * Stake SUI into Suilend
 * @param agent - SuiAgentKit instance
 * @param params - IStakingParams
 * @returns Promise resolving to the transaction hash
 */
export async function staking_suilend(
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
    throw new Error(`Failed to stake SUI into Suilend: ${error.message}`);
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

    const tokenData = listSpringSuiStaking.find(
      (r) => r.symbol.toLowerCase() === params.symbol.toLowerCase(),
    );
    if (!tokenData) {
      throw new Error("This token is not supported for staking Suilend");
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

    amount = Number(params.amount) * 10 ** 9;

    const appData: any = await getSuilendSdkData(agent);

    const lstClient = appData?.lstClientMap[tokenData.symbol];
    if (!lstClient) {
      throw new Error("This token is not supported for staking");
    }

    await lstClient.mintAndRebalanceAndSendToUser(
      transaction,
      agent.wallet_address,
      amount,
    );

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
