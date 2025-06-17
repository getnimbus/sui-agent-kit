import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { IBorrowParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import { AlphalendClient, getUserPositionCapId } from "@alphafi/alphalend-sdk";
/**
 * Borrow token into Alphalend
 * @param agent - SuiAgentKit instance
 * @param params - IBorrowParams
 * @returns Promise resolving to the transaction hash
 */
export async function borrow_alphalend(
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
    };
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to borrow token from Alphalend: ${error.message}`);
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: IBorrowParams,
): Promise<Transaction> => {
  try {
    const alphalendClient = new AlphalendClient("mainnet", agent.client);

    const marketsChain = await alphalendClient.getMarketsChain();
    if (!marketsChain || marketsChain.length === 0) {
      throw new Error("Failed to load market data");
    }
    const markets =
      await alphalendClient.getAllMarketsWithCachedMarkets(marketsChain);
    if (!markets || markets.length === 0) {
      throw new Error("Failed to load market data");
    }

    const positionCapId = await getUserPositionCapId(
      agent.client,
      "mainnet",
      agent.wallet_address,
    );

    const marketId = markets?.find(
      (item) => item.coinType === params?.tokenAddress,
    )?.marketId;

    if (!marketId) {
      throw new Error("Market id not found");
    }

    let amount = Number(params.amount);

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

    if (
      Number(nativeToken?.balance) <= 1 ||
      Number(nativeToken?.balance) < amount
    ) {
      throw new Error("Insufficient SUI native balance");
    }

    const borrowParams = {
      marketId,
      amount: BigInt(amount.toString()),
      coinType: params.collateral,
      positionCapId: positionCapId as string,
      address: agent.wallet_address,
      priceUpdateCoinTypes: params.listCoinTypeInPosition as string[],
    };

    const transaction: any = await alphalendClient.borrow(borrowParams);

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
