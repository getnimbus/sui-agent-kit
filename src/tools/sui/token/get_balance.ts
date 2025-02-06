import { SuiAgentKit, TokenBalance } from "../../../index";
import logger from "../../../utils/logger";

/**
 * Get the holdings asset of SUI token for the agent's wallet
 * @param agent - SuiAgentKit instance
 * @returns Promise resolving to the holdings as array of TokenBalance or null if account doesn't exist
 */
export async function get_holding(agent: SuiAgentKit): Promise<TokenBalance[]> {
  try {
    const client = agent.client;

    const balances = await client.getAllBalances({
      owner: agent.wallet_address,
    });
    const result = await Promise.all(
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

    return result;
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to get balance: ${error.message}`);
  }
}
