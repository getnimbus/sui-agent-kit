import { ClmmPoolUtil, initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { BN } from "bn.js";
import { d } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { TickMath } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { SuiAgentKit } from "../../agent";
import { ICreatePoolCLMMParams } from "../../types";
import logger from "../../utils/logger";

/**
 * Stake SUI
 * @param agent - SuiAgentKit instance
 * @param amount - The amount of SUI to stake
 * @param poolId - The pool ID to stake to
 * @returns Promise resolving to the transaction hash
 */

export async function create_pool_cetus_CLMM(
  agent: SuiAgentKit,
  params: ICreatePoolCLMMParams,
) {
  try {
    const [coinMetadataAID, coinMetadataBID] = await Promise.all([
      agent.client.getCoinMetadata({
        coinType: params.coinTypeA,
      }),
      agent.client.getCoinMetadata({
        coinType: params.coinTypeB,
      }),
    ]);

    if (!coinMetadataAID || !coinMetadataBID) {
      throw new Error("Coin metadata not found");
    }

    const decimalA = coinMetadataAID?.decimals ?? 9;
    const decimalB = coinMetadataBID?.decimals ?? 9;

    // initialize sqrt_price
    const initialize_sqrt_price = TickMath.priceToSqrtPriceX64(
      d(params.initializePrice),
      decimalA,
      decimalB,
    ).toString();

    const tick_spacing = params.tickSpacing;

    const current_tick_index = TickMath.sqrtPriceX64ToTickIndex(
      new BN(initialize_sqrt_price),
    );
    // build tick range
    const tick_lower = TickMath.getPrevInitializableTickIndex(
      new BN(current_tick_index).toNumber(),
      new BN(tick_spacing).toNumber(),
    );
    const tick_upper = TickMath.getNextInitializableTickIndex(
      new BN(current_tick_index).toNumber(),
      new BN(tick_spacing).toNumber(),
    );

    // input token amount
    const fix_coin_amount = new BN(params.inputTokenAmount);
    // input token amount is token a
    const fix_amount_a = params.isTokenAInput;
    // slippage default value 0.1 means 10%
    const slippage = params.slippage ?? 0.1;
    const cur_sqrt_price = new BN(initialize_sqrt_price);

    // Estimate liquidity and token amount from one amounts
    const liquidityInput = ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(
      tick_lower,
      tick_upper,
      fix_coin_amount,
      fix_amount_a,
      true,
      slippage,
      cur_sqrt_price,
    );
    // Estimate  token a and token b amount
    const amount_a = fix_amount_a
      ? fix_coin_amount.toNumber()
      : liquidityInput.tokenMaxA.toNumber();
    const amount_b = fix_amount_a
      ? liquidityInput.tokenMaxB.toNumber()
      : fix_coin_amount.toNumber();

    // Initialize the Cetus SDK
    const sdk = initCetusSDK({
      network: "mainnet",
    });

    sdk.senderAddress = agent.wallet_address;

    // build creatPoolPayload Payload
    const creatPoolPayload = await sdk.Pool.createPoolTransactionPayload({
      coinTypeA: params.coinTypeA,
      coinTypeB: params.coinTypeB,
      tick_spacing: tick_spacing,
      initialize_sqrt_price: initialize_sqrt_price,
      uri: "",
      amount_a,
      amount_b,
      fix_amount_a,
      tick_lower,
      tick_upper,
      metadata_a: coinMetadataAID?.id ?? "",
      metadata_b: coinMetadataBID?.id ?? "",
      slippage,
    });

    const txExec = await agent.client.signAndExecuteTransaction({
      signer: agent.wallet,
      transaction: creatPoolPayload,
    });

    // wait for the transaction to be executed
    const res = await agent.client.waitForTransaction({
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
    throw new Error(`Failed to create pool: ${error.message}`);
  }
}
