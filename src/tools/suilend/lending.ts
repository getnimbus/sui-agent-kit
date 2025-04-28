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
    throw new Error(`Failed to lending token from Suilend: ${error.message}`);
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

    if (!params?.tokenAddress) {
      throw new Error("Token address is required");
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

    const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
      appData?.suilendClient,
      transaction,
      obligationOwnerCap,
    );

    await appData?.suilendClient.depositIntoObligation(
      agent.wallet_address,
      params.tokenAddress,
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
