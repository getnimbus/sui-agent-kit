import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IUnstakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { useFetchAppDataSpringSui } from "./util";
import { get_holding } from "../sui/token/get_balance";

/**
 * Unstake token from Suilend
 * @param agent - SuiAgentKit instance
 * @param params - IUnstakingParams
 * @returns Promise resolving to the transaction hash
 */
export async function unstake_suilend(
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
    throw new Error(`Failed to unstake token into Suilend: ${error.message}`);
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

    // check balance for GAS FEE
    const nativeToken = balancesMetadata.find(
      (r) => r.address === "0x2::sui::SUI",
    );

    if (
      Number(nativeToken?.balance) <= 1 ||
      Number(nativeToken?.balance) < amount
    ) {
      throw new Error("Insufficient SUI native balance");
    }

    amount = Number(params.amount) * 10 ** (tokenData?.decimals || 9);

    const appDataSpringSui: any = await useFetchAppDataSpringSui(agent);

    const inToken: any = Object.values(appDataSpringSui.lstDataMap).find(
      (lstData: any) => lstData.token.symbol === params.symbol,
    );

    if (!inToken) {
      throw new Error("This token is not supported for unstake Suilend");
    }

    const inLstData = appDataSpringSui.lstDataMap[inToken?.token?.coinType];

    await inLstData!.lstClient.redeemAmountAndSendToUser(
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
