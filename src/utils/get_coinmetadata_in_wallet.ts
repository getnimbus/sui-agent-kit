import { SuiAgentKit } from "../agent";
import logger from "./logger";

export async function getCoinMetadataInWallet(
  agent: SuiAgentKit,
  token_symbol: string,
) {
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

    return coinMetadata;
  } catch (error) {
    logger.error(`Error getting coin metadata in wallet: ${error}`);
    return null;
  }
}
