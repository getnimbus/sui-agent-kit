import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { get_holding } from "../../tools/sui/token/get_balance";

const getWalletHolding: Action = {
  name: "GET_WALLET_HOLDING",
  similes: ["wallet holding", "holding", "wallet"],
  description: "Get wallet holding asset of the agent",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          address: "0x1234567890abcdef",
        },
        explanation: "The agent's wallet address is 0x1234567890abcdef",
      },
    ],
  ],
  schema: z.object({}),
  handler: async (agent: SuiAgentKit) => ({
    status: "success",
    holdings: get_holding(agent),
  }),
};

export default getWalletHolding;
