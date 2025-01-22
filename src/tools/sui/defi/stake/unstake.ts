import { StakedSui, SuiAgentKit, TransactionResponse } from "../../../../index";
import { Transaction } from "@mysten/sui/transactions";
import logger from "../../../../utils/logger";
import { SUI_SYSTEM_STATE_OBJECT_ID } from "@mysten/sui/utils";
/**
 * Stake SUI
 * @param agent - SuiAgentKit instance
 * @param stakedSui - The staked SUI object
 * @returns Promise resolving to the transaction hash
 */

export async function unstake(
  agent: SuiAgentKit,
  stakedSui: StakedSui,
): Promise<TransactionResponse> {
  try {
    const client = agent.client;

    // prepare transaction
    const txb = new Transaction();
    txb.setSender(agent.wallet_address);
    txb.setGasOwner(agent.wallet_address);

    // get the coin object
    txb.moveCall({
      target: "0x3::sui_system::request_withdraw_stake",
      arguments: [
        txb.object(SUI_SYSTEM_STATE_OBJECT_ID),
        txb.object(stakedSui.id),
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
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to stake");
  }
}
