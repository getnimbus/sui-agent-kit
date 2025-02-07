import { SuinsClient } from "@mysten/suins";
import { SuiAgentKit } from "../../index";
import { NameRecord } from "@mysten/suins/dist/cjs/types";
import logger from "../../utils/logger";

/**
 * Get the NameRecord object for a given domain name
 * @param agent - SuiAgentKit instance
 * @param name - The domain name to look up
 * @returns Promise resolving to the NameRecord object for the domain or null if not found
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

    if (!name.endsWith(".sui")) {
      name = name + ".sui";
    }

    // Create a transaction block as usual in your PTBs.
    const nameRecord = await suinsClient.getNameRecord(name);

    return nameRecord;
  } catch (error: any) {
    logger.error(error);
    throw error;
  }
}
