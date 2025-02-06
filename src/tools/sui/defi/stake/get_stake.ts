import { DelegatedStake } from "@mysten/sui/client";
import { SuiAgentKit } from "../../../../index";
import logger from "../../../../utils/logger";

/**
 * Get the holdings asset of SUI token for the agent's wallet
 * @param agent - SuiAgentKit instance
 * @returns Promise resolving to the holdings as array of DelegatedStake
 */
export async function get_stake(agent: SuiAgentKit): Promise<DelegatedStake[]> {
  try {
    const client = agent.client;

    const result = await client.getStakes({ owner: agent.wallet_address });

    return result;
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to get stakes: ${error.message}`);
  }
}
