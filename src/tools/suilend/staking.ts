import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { IStakingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import {
  useFetchAppData,
  useFetchAppDataSpringSui,
  useFetchUserData,
} from "./util";
import {
  createObligationIfNoneExists,
  sendObligationToUser,
} from "@suilend/sdk";
/**
 * Stake token into Suilend
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

    const allAppData: any = await useFetchAppData(agent);
    const appDataSpringSui: any = await useFetchAppDataSpringSui(agent);
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

    const outToken: any = Object.values(appDataSpringSui?.lstDataMap).find(
      (lstData: any) => lstData?.token?.symbol === params?.symbol,
    );

    if (!outToken) {
      throw new Error("This token is not supported for staking Suilend");
    }

    const outLstData =
      await appDataSpringSui?.lstDataMap[outToken?.token?.coinType];

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

    // TODO: update case user wanna stake and deposit and then set to true condition
    if (false) {
      const obligation = appDataSpringSui.obligations?.[0]; // Obligation with the highest TVL
      const obligationOwnerCap = appDataSpringSui.obligationOwnerCaps?.find(
        (o: any) => o.obligationId === obligation?.id,
      );

      const { obligationOwnerCapId, didCreate } = createObligationIfNoneExists(
        appDataSpringSui?.suilendClient,
        transaction,
        obligationOwnerCap,
      );

      const lstCoin = outLstData!.lstClient.mintAmountAndRebalance(
        transaction,
        agent.wallet_address,
        amount,
      );

      await appDataSpringSui?.suilendClient?.deposit(
        lstCoin,
        outLstData!.token.coinType,
        obligationOwnerCapId,
        transaction,
      );

      if (didCreate) {
        sendObligationToUser(
          obligationOwnerCapId,
          agent.wallet_address,
          transaction,
        );
      }
    } else {
      await outLstData!.lstClient.mintAmountAndRebalanceAndSendToUser(
        transaction,
        agent.wallet_address,
        amount,
      );
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
