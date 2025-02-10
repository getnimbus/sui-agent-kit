import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { ILendingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { listSUITokenSupportStakeSDKSuilend } from "./util";
import { getSuilendSdkData } from "./util";
import { get_holding } from "../sui/token/get_balance";
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

    const appData: any = await getSuilendSdkData(agent);

    const obligation = appData?.obligations?.[0];
    const obligationOwnerCap = appData?.obligationOwnerCaps?.find(
      (o: any) => o?.obligationId === obligation?.id,
    );

    const isNotEcosystemLTS = listSUITokenSupportStakeSDKSuilend.includes(
      tokenData.symbol,
    );

    if (isNotEcosystemLTS) {
      await appData?.suilendClient.depositIntoObligation(
        agent.wallet_address,
        tokenData.address,
        amount as any,
        transaction as any,
        obligationOwnerCap?.id as string,
      );
    } else {
      const lstClient = appData?.lstClientMap[tokenData.symbol];
      if (!lstClient) {
        throw new Error("This token is not supported for staking");
      }
      const lstDataStaking = appData?.lstDataMap[tokenData.symbol];

      const coinTypeStaking =
        appData?.lendingMarket?.reserves.find(
          (r: any) => r.symbol.toLowerCase() === tokenData.symbol,
        )?.coinType || lstDataStaking?.token?.coinType;

      await appData?.suilendClient?.depositCoin(
        agent.wallet_address,
        lstClient.mintAndRebalance(transaction, amount),
        coinTypeStaking,
        transaction as any,
        obligationOwnerCap?.id,
      );
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
