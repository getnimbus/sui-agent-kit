import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { withdraw_suilend } from "../../tools/suilend";
import { IUnstakingParams } from "../../types/farming";

const unstakeSuilend: Action = {
  name: "WITHDRAW_SUILEND",
  similes: [
    "withdraw suilend",
    "withdraw from suilend",
    "suilend withdraw",
    "withdraw LST",
  ],
  description: "Unstake tokens from Suilend protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "sSUI",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully unstaked 1 sSUI from Suilend protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IUnstakingParams = {
      type: "UNSTAKING",
      amount: input.amount,
      symbol: input.symbol,
    };

    const result = await withdraw_suilend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default unstakeSuilend;
