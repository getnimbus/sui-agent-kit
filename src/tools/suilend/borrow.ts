import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { IBorrowParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { useFetchAppData, useFetchUserData } from "./util";
import { get_holding } from "../sui/token/get_balance";

/**
 * Borrow token from Suilend
 * @param agent - SuiAgentKit instance
 * @param params - IStakingParams
 * @returns Promise resolving to the transaction hash
 */

// NOT COMPLETED
export async function borrow_suilend(
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
      // tx_hash: "",
      // tx_status: "success",
    };
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to borrow token from Suilend: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: IBorrowParams,
): Promise<Transaction> => {
  try {
    const transaction = new Transaction();

    let amount = Number(params.amount);
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // check balance
    const balancesMetadata = await get_holding(agent);

    const tokenData = balancesMetadata.find(
      (r) => r.symbol === params.collateral,
    );

    if (!tokenData) {
      throw new Error("Token not found in your wallet");
    }

    amount = Number(params.amount) * 10 ** (tokenData?.decimals || 9);

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

    const coinTypeBorrow = appData?.lendingMarket?.reserves.find(
      (r: any) => r.symbol === params.collateral,
    );

    if (!coinTypeBorrow) {
      throw new Error("This token is not supported for borrowing");
    }

    await appData?.suilendClient.borrowAndSendToUser(
      agent.wallet_address,
      obligationOwnerCap?.id,
      obligation?.id,
      coinTypeBorrow?.token?.coinType,
      amount * 10 ** (coinTypeBorrow?.token?.decimals || 9),
      transaction,
    );

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
