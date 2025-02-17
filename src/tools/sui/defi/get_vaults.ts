import { SuiAgentKit } from "../../../agent";
import logger from "../../../utils/logger";
import { nimbusClient } from "../../../utils/nimbus_api";
import {
  IGetVaultsParams,
  VaultTVL,
  VaultAPR,
  VaultType,
} from "../../../types";
import axios from "axios";

const types = [
  VaultType.LP,
  VaultType.VAULT,
  VaultType.STAKING,
  VaultType.LENDING,
];

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
    protocol: "",
    tvl: VaultTVL.EMPTY,
    apr: VaultAPR.EMPTY,
    tags: [],
  },
) {
  try {
    const requests = types.map((type) => {
      return nimbusClient.get("/v2/farming/vaults", {
        params: {
          ...params,
          type: type,
          limit: 5,
          apr: encodeURIComponent(params.apr),
          tvl: encodeURIComponent(params.tvl),
          chain: "SUI",
        },
      });
    });

    const res = await axios.all(requests).then((responses) => {
      return responses.map((response) => response.data?.data);
    });

    return res.flat();
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to get vaults: ${error.message}`);
  }
}
