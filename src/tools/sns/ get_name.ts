import { SuinsClient, SuinsTransaction } from "@mysten/suins";
import { SuiAgentKit } from "../../index";
import { NameRecord } from "@mysten/suins/dist/cjs/types";
import logger from "../../utils/logger";

/**
 * Get the holdings asset of SUI token for the agent's wallet
 * @param agent - SuiAgentKit instance
 * @returns Promise resolving to the holdings as array of TokenBalance or null if account doesn't exist
 */
export async function get_name_record(
  agent: SuiAgentKit,
  name: string,
): Promise<NameRecord | null> {
  try {
    const suinsClient = new SuinsClient({
      client: agent.client as any,
      network: "mainnet",
    });
    // Create a transaction block as usual in your PTBs.
    const nameRecord = await suinsClient.getNameRecord(name);

    return nameRecord;
  } catch (error: any) {
    logger.error(error);
    throw error;
  }
}
