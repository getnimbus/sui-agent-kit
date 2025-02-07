import { SuinsClient } from "@mysten/suins";
import { SuiAgentKit } from "../../index";
import { NameRecordX } from "../../types";
import logger from "../../utils/logger";
import dayjs from "dayjs";

/**
 * Get the NameRecord object for a given domain name
 * @param agent - SuiAgentKit instance
 * @param name - The domain name to look up
 * @returns Promise resolving to the NameRecord object for the domain or null if not found
 */
export async function get_name_record(
  agent: SuiAgentKit,
  name: string,
): Promise<NameRecordX | null> {
  try {
    const suinsClient = new SuinsClient({
      client: agent.client as any,
      network: "mainnet",
    });

    // Modify name following suins
    name = name.toLowerCase();
    if (!name.endsWith(".sui")) {
      name = name + ".sui";
    }

    // Create a transaction block as usual in your PTBs.
    const nameRecord = await suinsClient.getNameRecord(name);
    if (!nameRecord) {
      return null;
    }

    const humanReadableExpirationTimestampMs = dayjs(
      Number(nameRecord.expirationTimestampMs),
    ).format("YYYY-MM-DD"); // Format to match expected output

    return {
      ...nameRecord,
      humanReadableExpirationTimestampMs,
    };
  } catch (error: any) {
    logger.error(error);
    throw error;
  }
}
