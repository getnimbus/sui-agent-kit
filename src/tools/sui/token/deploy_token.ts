import { SuiAgentKit, TransferTokenResponse } from "../../../index";
import { Transaction } from "@mysten/sui/transactions";
import logger from "../../../utils/logger";
import { CREATE_TOKEN_SUI_FEE } from "../../../constants";
import {
  getBytecode,
  ICreateTokenForm,
} from "../../../utils/move-template/coin";
import { normalizeSuiAddress, SUI_TYPE_ARG } from "@mysten/sui/utils";
// @ts-expect-error no check
import initMoveByteCodeTemplate from "../../../utils/move-template/move-bytecode-template";

/**
 * Transfer token to another address
 * @param agent - SuiAgentKit instance
 * @param token_symbol - The symbol of the token to transfer
 * @param to - The address to transfer the token to
 * @param amount - The amount of token to transfer
 * @returns Promise resolving to the transaction hash
 */

export async function deploy_token(
  agent: SuiAgentKit,
  form: ICreateTokenForm,
): Promise<TransferTokenResponse> {
  try {
    const client = agent.client;
    await initMoveByteCodeTemplate(
      "https://www.suicoins.com/move_bytecode_template_bg.wasm",
    );

    const tx = new Transaction();

    // if (!coinsMap[SUI_TYPE_ARG])
    //   throw new Error("You doesn't have enough SUI on your wallet");

    // get the coin object
    const coinXs = await client.getCoins({
      owner: agent.wallet_address,
      coinType: SUI_TYPE_ARG,
    });

    const total_balance = coinXs.data.reduce(
      (acc, coin) => acc + Number(coin.balance),
      0,
    );

    if (total_balance < CREATE_TOKEN_SUI_FEE) {
      throw new Error("Insufficient balance");
    }

    const [fee] = tx.splitCoins(tx.gas, [String(CREATE_TOKEN_SUI_FEE)]);

    tx.transferObjects([fee], tx.pure.address(agent.wallet_address));

    const bytecode = await getBytecode({
      name: form.name,
      symbol: form.symbol,
      totalSupply: form.totalSupply,
      decimals: form.decimals,
      imageUrl: form.imageUrl,
      description: form.description,
      fixedSupply: form.fixedSupply,
      recipient: agent.wallet_address,
    });

    const [upgradeCap] = tx.publish({
      modules: [[...bytecode]],
      dependencies: [normalizeSuiAddress("0x1"), normalizeSuiAddress("0x2")],
    });

    tx.transferObjects([upgradeCap], tx.pure.address(agent.wallet_address));

    const txExec = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: agent.wallet,
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
    throw new Error(`Failed to deploy token: ${error.message}`);
  }
}
