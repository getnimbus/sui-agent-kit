import { setSuiClient, getQuote, buildTx } from "@7kprotocol/sdk-ts";
import { ISwapParams, SuiAgentKit, TransactionResponse } from "../../../index";
import logger from "../../../utils/logger";

/**
 * Transfer token to another address
 * @param agent - SuiAgentKit instance
 * @returns Promise resolving to the transaction hash
 */

export async function swap(
  agent: SuiAgentKit,
  params: ISwapParams,
): Promise<TransactionResponse> {
  try {
    const client = agent.client;

    // check balance
    const [balance, metadata] = await Promise.all([
      client.getBalance({
        owner: agent.wallet_address,
        coinType: params.fromToken,
      }),
      client.getCoinMetadata({
        coinType: params.fromToken,
      }),
    ]);

    if (!metadata) {
      throw new Error(`Token ${params.fromToken} not found in wallet`);
    }

    if (
      Number(balance.totalBalance) / 10 ** (metadata?.decimals || 9) <
      params.inputAmount
    ) {
      throw new Error("Insufficient balance");
    }

    setSuiClient(agent.client);
    const quoteResponse: any = await getQuote({
      tokenIn: params.fromToken,
      tokenOut: params.toToken,
      amountIn: BigInt(
        params.inputAmount * 10 ** (metadata?.decimals || 9),
      ).toString(),
    });

    const txBuild = await buildTx({
      quoteResponse,
      accountAddress: agent.wallet_address,
      slippage: Number(params.slippage || 0.01), // settings slippage or default 1%
      commission: {
        partner:
          "0xfcd7df57ede898715bc7c5aba3dd31e23b715d2dd16668383ce123666a5e24c3",
        commissionBps: 0,
      },
    });

    const txExec = await client.signAndExecuteTransaction({
      signer: agent.wallet,
      transaction: txBuild.tx,
    });

    const tx = await client.waitForTransaction({
      digest: txExec.digest,
      options: {
        showEffects: true,
      },
    });

    return {
      tx_hash: txExec.digest,
      tx_status: tx.effects?.status.status || "unknown",
    };
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to transfer token");
  }
}
