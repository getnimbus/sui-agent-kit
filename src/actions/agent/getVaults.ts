import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { VaultTVL, VaultAPR, VaultTags } from "../../types";
import { getVaults } from "../../tools/sui/defi/get_vaults";

const getVaultsAction: Action = {
  name: "GET_VAULTS",
  similes: [
    "get vaults",
    "list vaults",
    "show vaults",
    "view vaults",
    "get investments",
    "list investments",
    "show investments",
    "view investments",
    "get farming",
    "list farming",
    "show farming",
    "view farming",
    "get yield",
    "list yield",
    "show yield",
    "view yield",
    "get yield farming",
    "list yield farming",
  ],
  description: "Get information about DeFi vaults with optional filtering",
  examples: [
    [
      {
        input: {
          address: "",
          order: "tvl",
          protocol: "",
          tvl: VaultTVL.EMPTY,
          apr: VaultAPR.EMPTY,
          tags: [],
        },
        output: {
          status: "success",
          data: [
            {
              id: "navi-lending:0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
              name: "DEEP",
              chain: "SUI",
              protocol: {
                name: "Navi",
                logo: "https://assets.coingecko.com/coins/images/32650/standard/LOGO_%281%29.png?1698895082",
                id: "navi",
              },
              type: "LENDING",
              apy: 0.0019638327,
              apr: 0.001962067288467928,
              apr_rewards: 0.1410041803661191,
              apy_rewards: 0.1504833853,
              tvl: 25911676.01827965,
              rewards: { tokens: [Array] },
              totalApr: 0.1427298512128079,
              totalApy: 0.152447218,
              farmLink:
                "https://app.naviprotocol.io/details?id=15&oracleId=15&coinType=0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
              label: ["low_risk", "stable_yield"],
              coins: [
                "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
              ],
              createdAt: "2025-01-07T19:00:03.223Z",
              updatedAt: "2025-02-15T04:00:05.163Z",
              logos: [
                "https://token-logo.service.getnimbus.io/api/v1/logo?address=0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP&chain=SUI",
              ],
              logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
              stats: { "7d": {}, "30d": {} },
            },
          ],
        },
        explanation: "Retrieved 2 LP vaults sorted by TVL in descending order",
      },
    ],
  ],
  schema: z.object({
    address: z.string().optional(),
    order: z.string().optional(),
    protocol: z.string().optional(),
    tvl: z.nativeEnum(VaultTVL).optional(),
    apr: z.nativeEnum(VaultAPR).optional(),
    tags: z.array(z.nativeEnum(VaultTags)).optional(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await getVaults(agent, {
      address: input.address || "",
      order: input.order || "tvl",
      protocol: input.protocol || "",
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
