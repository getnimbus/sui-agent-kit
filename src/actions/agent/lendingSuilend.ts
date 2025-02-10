import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { lending_suilend } from "../../tools/suilend";
import { ILendingParams } from "../../types/farming";

const lendingSuilend: Action = {
  name: "LENDING_SUILEND",
  similes: [
    "lending suilend",
    "lend to suilend",
    "suilend lend",
    "deposit to suilend",
  ],
  description: "Lend tokens into Suilend protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "ssui",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully lent 1 SUI into Suilend protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: ILendingParams = {
      type: "LENDING",
      amount: input.amount,
      symbol: input.symbol,
    };

    const result = await lending_suilend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default lendingSuilend;
