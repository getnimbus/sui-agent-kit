import { SuiAgentKit, TransactionResponse } from "../../../index";
import { Transaction } from "@mysten/sui/transactions";
import logger from "../../../utils/logger";
/**
 * Transfer token to another address
 * @param agent - SuiAgentKit instance
 * @param token_symbol - The symbol of the token to transfer
 * @param to - The address to transfer the token to
 * @param amount - The amount of token to transfer
 * @returns Promise resolving to the transaction hash
 */

export async function transfer_token(
  agent: SuiAgentKit,
  token_symbol: string,
  to: string,
  amount: number,
): Promise<TransactionResponse> {
  try {
    const client = agent.client;

    // get metadata of all coins
    const balances = await client.getAllBalances({
      owner: agent.wallet_address,
    });
    const coins = await Promise.all(
      balances.map(async (balance) => {
        const metadata = await client.getCoinMetadata({
          coinType: balance.coinType,
        });
        return {
          address: balance.coinType,
          name: metadata?.name || "",
          symbol: metadata?.symbol || "",
          decimals: metadata?.decimals || 0,
          balance: (
            Number(balance.totalBalance) /
            10 ** (metadata?.decimals || 0)
          ).toString(),
        };
      }),
    );

    // get the coin metadata to transfer
    const coinMetadata = coins.find((coin) => coin.symbol === token_symbol);

    if (!coinMetadata) {
      throw new Error(`Token ${token_symbol} not found in wallet`);
    }

    // prepare transaction
    const txb = new Transaction();
    txb.setSender(agent.wallet_address);
    txb.setGasOwner(agent.wallet_address);

    // get the coin object
    const coinXs = await client.getCoins({
      owner: agent.wallet_address,
      coinType: coinMetadata.address,
    });
    const [primaryCoinX, ...restCoinXs] = coinXs.data;

    // check if the balance is enough
    const decimals = coinMetadata.decimals;
    const total_balance = coinXs.data.reduce(
      (acc, coin) => acc + Number(coin.balance),
      0,
    );

    if (total_balance / 10 ** decimals < amount) {
      throw new Error("Insufficient balance");
    }

    // split the coin
    const coinObjId =
      token_symbol === "SUI" ? txb.gas : primaryCoinX.coinObjectId;
    const [coin] = txb.splitCoins(coinObjId, [amount * 10 ** decimals]);

    txb.transferObjects([coin], to);

    // execute the transaction
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
    throw new Error(`Failed to transfer token: ${error.message}`);
  }
}
