import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { ILendingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import { useFetchAppData, useFetchUserData } from "./util";
import {
  createObligationIfNoneExists,
  sendObligationToUser,
} from "@suilend/sdk";
/**
 * Lending token into Suilend
 * @param agent - SuiAgentKit instance
 * @param params - ILendingParams
 * @returns Promise resolving to the transaction hash
 */
export async function lending_suilend(
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
    throw new Error(`Failed to lending token into Suilend: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: ILendingParams,
): Promise<Transaction> => {
  try {
    const transaction = new Transaction();

    let amount = Number(params.amount);
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const allAppData: any = await useFetchAppData(agent);
    const allUserData = await useFetchUserData(allAppData, agent);

    const appData: any =
      Object.values(allAppData ?? {}).find(
        (item: any) => item?.lendingMarket?.slug === "market",
      ) ?? Object.values(allAppData ?? {})[0];

    const userData = appData?.lendingMarket?.id
      ? allUserData?.[appData?.lendingMarket?.id]
      : undefined;

    const obligation = userData && userData?.obligations?.[0];

    const obligationOwnerCap =
      userData &&
      userData?.obligationOwnerCaps?.find(
        (o: any) => o.obligationId === obligation?.id,
      );

    // check balance
    const balancesMetadata = await get_holding(agent);

    const tokenData = balancesMetadata.find(
      (r) => r.symbol.toLowerCase() === params.symbol.toLowerCase(),
    );

    if (!tokenData) {
      throw new Error("Token not found in your wallet");
    }

    if (tokenData.balance < amount.toString()) {
      throw new Error("Insufficient balance");
    }

    amount = Number(params.amount) * 10 ** (tokenData?.decimals || 9);

    const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
      appData?.suilendClient,
      transaction,
      obligationOwnerCap,
    );

    await appData?.suilendClient.depositIntoObligation(
      agent.wallet_address,
      tokenData.address,
      amount as any,
      transaction as any,
      obligationOwnerCapId as string,
    );

    if (didCreate) {
      sendObligationToUser(
        obligationOwnerCapId,
        agent.wallet_address,
        transaction,
      );
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
