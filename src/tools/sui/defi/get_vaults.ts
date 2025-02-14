import { SuiAgentKit } from "../../../agent";
import logger from "../../../utils/logger";
import { nimbusClient } from "../../../utils/nimbus_api";
import {
  IGetVaultsParams,
  VaultTVL,
  VaultAPR,
  VaultType,
} from "../../../types";

/**
 * Get vaults information
 * @param agent - SuiAgentKit instance
 * @param params - Parameters for filtering vaults
 * @returns Promise resolving to the vaults data
 */
export async function getVaults(
  agent: SuiAgentKit,
  params: IGetVaultsParams = {
    address: "",
    order: "tvl",
    sort: "desc",
    limit: 10,
    offset: 0,
    protocol: "",
    type: VaultType.EMPTY,
    tvl: VaultTVL.EMPTY,
    apr: VaultAPR.EMPTY,
    tags: [],
  },
) {
  try {
    const response = await nimbusClient.get("/v2/farming/vaults", {
      params: {
        ...params,
        apr: encodeURIComponent(params.apr),
        tvl: encodeURIComponent(params.tvl),
      },
    });
    return response.data;
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to get vaults: ${error.message}`);
  }
}
