import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { get_name_record } from "../../tools/sns/ get_name";

const getSnsNameRecord: Action = {
  name: "GET_SNS_NAME_RECORD",
  similes: [
    "get sns record",
    "check domain",
    "lookup domain",
    "get domain info",
  ],
  description: "Get the record information for a Sui Name Service (SNS) domain",
  examples: [
    [
      {
        input: {
          name: "mydomain",
        },
        output: {
          status: "success",
          result: {
            name: "nimbus.sui",
            nftId:
              "0xcefcd5c8ca143ba86566d5face2fffc1361d24d19deeb94a8576e83319731609",
            targetAddress:
              "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
            expirationTimestampMs: "1740448978459",
            data: {},
            avatar: undefined,
            contentHash: undefined,
            walrusSiteId: undefined,
          },
        },
        explanation: "Retrieved information for 'nimbus.sui'",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await get_name_record(agent, input.name);

    return {
      status: "success",
      result,
    };
  },
};

export default getSnsNameRecord;
