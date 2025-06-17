import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { ILendingParams } from "../../../../types/farming";
import { lending_scallop } from "../../../../tools/scallop";

const lendingScallop: Action = {
  name: "LENDING_SCALLOP",
  similes: [
    "lending scallop",
    "lend to scallop",
    "scallop lend",
    "deposit to scallop",
  ],
  description: "Lend tokens into Scallop protocol",
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
        explanation: "Successfully lent 1 SUI into Scallop protocol",
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

    const result = await lending_scallop(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default lendingScallop;
