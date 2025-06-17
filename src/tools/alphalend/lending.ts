import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { ILendingParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import { getCoinMetadataInWallet } from "../../utils/get_coinmetadata_in_wallet";
import { AlphalendClient } from "@alphafi/alphalend-sdk";
/**
 * Lend token into Alphalend
 * @param agent - SuiAgentKit instance
 * @param params - ILendingParams
 * @returns Promise resolving to the transaction hash
 */
export async function lending_alphalend(
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
    throw new Error(`Failed to lend token into Alphalend: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: ILendingParams,
): Promise<Transaction> => {
  try {
    const alphalendClient = new AlphalendClient("mainnet", agent.client);

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

    const marketsChain = await alphalendClient.getMarketsChain();
    if (!marketsChain || marketsChain.length === 0) {
      throw new Error("Failed to load market data");
    }
    const markets =
      await alphalendClient.getAllMarketsWithCachedMarkets(marketsChain);
    if (!markets || markets.length === 0) {
      throw new Error("Failed to load market data");
    }

    const marketId = markets?.find(
      (item) => item.coinType === params?.tokenAddress,
    )?.marketId;

    if (!marketId) {
      throw new Error("Market id not found");
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

    const supplyParams = {
      marketId,
      amount: BigInt(params.amount.toString()),
      coinType: params.tokenAddress as string,
      address: agent.wallet_address,
    };

    const transaction: any = await alphalendClient.supply(supplyParams);

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
