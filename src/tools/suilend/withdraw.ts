import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IUnstakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { getSuilendSdkData } from "./util";
import { get_holding } from "../sui/token/get_balance";

/**
 * Withdraw token from Suilend
 * @param agent - SuiAgentKit instance
 * @param params - IUnstakingParams
 * @returns Promise resolving to the transaction hash
 */
export async function withdraw_suilend(
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
    throw new Error(`Failed to stake SUI into Suilend: ${error.message}`);
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

    const appData: any = await getSuilendSdkData(agent);

    const obligation = appData?.obligations?.[0];
    const obligationOwnerCap = appData?.obligationOwnerCaps?.find(
      (o: any) => o?.obligationId === obligation?.id,
    );

    const lstDataUnstacking = appData?.lstDataMap[tokenData.symbol];
    if (!lstDataUnstacking) {
      throw new Error("This token is not supported for unstaking");
    }

    const coinTypeUnstaking =
      appData?.lendingMarket?.reserves.find(
        (r: any) => r.symbol === tokenData.symbol,
      )?.coinType || lstDataUnstacking?.token?.coinType;

    await appData?.suilendClient.withdrawAndSendToUser(
      agent.wallet_address,
      obligationOwnerCap.id,
      obligation.id,
      coinTypeUnstaking,
      amount,
      transaction,
    );

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
