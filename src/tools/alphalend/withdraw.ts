import { SuiAgentKit, TransactionResponse } from "../../index";
import logger from "../../utils/logger";
import { IWithdrawParams } from "../../types/farming";
import { Transaction } from "@mysten/sui/transactions";
import { get_holding } from "../sui/token/get_balance";
import { AlphalendClient, getUserPositionCapId } from "@alphafi/alphalend-sdk";
/**
 * Withdraw token from Alphalend
 * @param agent - SuiAgentKit instance
 * @param params - IWithdrawParams
 * @returns Promise resolving to the transaction hash
 */
export async function withdraw_alphalend(
  agent: SuiAgentKit,
  params: IWithdrawParams,
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
    throw new Error(
      `Failed to withdraw token from Alphalend: ${error.message}`,
    );
  }
}

const getTransactionPayload = async (
  agent: SuiAgentKit,
  params: IWithdrawParams,
): Promise<Transaction> => {
  try {
    const alphalendClient = new AlphalendClient("mainnet", agent.client);

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

    const withdrawParams = {
      marketId,
      amount: BigInt(params.amount.toString()),
      coinType: params.tokenAddress as string,
      positionCapId: positionCapId as string,
      address: agent.wallet_address,
      priceUpdateCoinTypes: params.listCoinTypeInPosition as string[],
    };

    const transaction: any = await alphalendClient.withdraw(withdrawParams);

    return transaction;
  } catch (e) {
    logger.error(e);
    throw new Error(`Failed to get transaction payload: ${e}`);
  }
};
