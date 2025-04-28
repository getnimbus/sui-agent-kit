import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";

import { ILendingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { ScallopService } from "./utils";
import { ScallopBuilder } from "@scallop-io/sui-scallop-sdk";
import { get_holding } from "../sui/token/get_balance";
/**
 * Lending token into Scallop
 * @param agent - SuiAgentKit instance
 * @param params - ILendingParams
 * @returns Promise resolving to the transaction hash
 */
export async function lending_scallop(
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
    throw new Error(`Failed to lending token from Scallop: ${error.message}`);
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

    // TODO: update not remove hardcode decimal cause we support all token
    amount = Number(params.amount) * 10 ** 9;

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

    const scallopService = ScallopService.getInstance();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallopService.getScallopQuery(),
      scallopService.getScallopClient(),
    ]);

    const scallopBuilder = new ScallopBuilder({
      addressId: "67c44a103fe1b8c454eb9699",
      walletAddress: agent.wallet_address,
      networkType: "mainnet",
    });
    await scallopBuilder.init();

    const obligationAddress = await scallopQuery.getObligations(
      agent.wallet_address,
    );

    if (obligationAddress.length !== 0) {
      const obligationId = obligationAddress[0].id;
      await scallopClient.depositCollateral(
        params.symbol as any,
        amount,
        false,
        obligationId,
        agent.wallet_address,
      );
    } else {
      await scallopClient.deposit(
        params.symbol as any,
        amount,
        false,
        agent.wallet_address,
      );
    }

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
