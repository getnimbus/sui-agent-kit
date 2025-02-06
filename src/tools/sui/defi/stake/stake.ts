import { SuiAgentKit, TransactionResponse } from "../../../../index";
import { Transaction } from "@mysten/sui/transactions";
import logger from "../../../../utils/logger";
import { SUI_COIN_TYPE, SUI_DECIMALS } from "../../../../constants";
import { SUI_SYSTEM_STATE_OBJECT_ID } from "@mysten/sui/utils";
/**
 * Stake SUI
 * @param agent - SuiAgentKit instance
 * @param amount - The amount of SUI to stake
 * @param poolId - The pool ID to stake to
 * @returns Promise resolving to the transaction hash
 */

export async function stake(
  agent: SuiAgentKit,
  amount: number,
  poolId: string,
): Promise<TransactionResponse> {
  try {
    const client = agent.client;

    // prepare transaction
    const txb = new Transaction();
    txb.setSender(agent.wallet_address);
    txb.setGasOwner(agent.wallet_address);

    // get the coin object
    const coinXs = await client.getCoins({
      owner: agent.wallet_address,
      coinType: SUI_COIN_TYPE,
    });
    const [primaryCoinX, ...restCoinXs] = coinXs.data;

    // merge the coins
    if (restCoinXs.length > 0) {
      txb.mergeCoins(
        txb.object(primaryCoinX.coinObjectId),
        restCoinXs.map((coin) => txb.object(coin.coinObjectId)),
      );
    }

    // check if the balance is enough
    const decimals = SUI_DECIMALS;
    const total_balance = coinXs.data.reduce(
      (acc, coin) => acc + Number(coin.balance),
      0,
    );

    const balance = total_balance / 10 ** decimals;
    if (balance < amount || amount < 1) {
      throw new Error("Insufficient balance");
    }

    // Convert amount to base units before splitting
    const amountInBaseUnits = BigInt(Math.floor(amount * 10 ** decimals));

    // split the coin using base units
    const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInBaseUnits)]);

    // stake the coin
    txb.moveCall({
      target: "0x3::sui_system::request_add_stake",
      arguments: [
        txb.sharedObjectRef({
          objectId: SUI_SYSTEM_STATE_OBJECT_ID,
          initialSharedVersion: 1,
          mutable: true,
        }),
        coin,
        txb.pure.address(poolId),
      ],
    });

    const txExec = await client.signAndExecuteTransaction({
      signer: agent.wallet,
      transaction: txb,
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
    throw new Error(`Failed to stake: ${error.message}`);
  }
}
