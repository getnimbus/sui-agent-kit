import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { VaultType, VaultTVL, VaultAPR, VaultTags } from "../../types";
import { getVaults } from "../../tools/sui/defi/get_vaults";

const getVaultsAction: Action = {
  name: "GET_VAULTS",
  similes: ["get vaults", "list vaults", "show vaults", "view vaults"],
  description: "Get information about DeFi vaults with optional filtering",
  examples: [
    [
      {
        input: {
          limit: 2,
          type: VaultType.LP,
        },
        output: {
          status: "success",
          result: {
            vaults: [
              {
                address: "0x...",
                protocol: "Protocol1",
                type: "LP",
                tvl: "1000000",
                apr: "10%",
                tags: ["stable_yield"],
              },
              {
                address: "0x...",
                protocol: "Protocol2",
                type: "LP",
                tvl: "500000",
                apr: "15%",
                tags: ["high_risk_high_return"],
              },
            ],
          },
        },
        explanation: "Retrieved 2 LP vaults sorted by TVL in descending order",
      },
    ],
  ],
  schema: z.object({
    address: z.string().optional(),
    order: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    limit: z.number().positive().optional(),
    offset: z.number().min(0).optional(),
    protocol: z.string().optional(),
    type: z.nativeEnum(VaultType).optional(),
    tvl: z.nativeEnum(VaultTVL).optional(),
    apr: z.nativeEnum(VaultAPR).optional(),
    tags: z.array(z.nativeEnum(VaultTags)).optional(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await getVaults(agent, {
      address: input.address || "",
      order: input.order || "tvl",
      sort: input.sort || "desc",
      limit: input.limit || 10,
      offset: input.offset || 0,
      protocol: input.protocol || "",
      type: input.type || VaultType.EMPTY,
      tvl: input.tvl || VaultTVL.EMPTY,
      apr: input.apr || VaultAPR.EMPTY,
      tags: input.tags || [],
    });

    return {
      status: "success",
      result,
    };
  },
};

export default getVaultsAction;
