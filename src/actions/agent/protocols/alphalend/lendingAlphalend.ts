import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { ILendingParams } from "../../../../types/farming";
import { lending_alphalend } from "../../../../tools/alphalend";

const lendingAlphalend: Action = {
  name: "LENDING_ALPHALEND",
  similes: [
    "lending alphalend",
    "lend to alphalend",
    "alphalend lend",
    "deposit to alphalend",
  ],
  description: "Lend tokens into Alphalend protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "ssui",
          tokenAddress: "0x2::sui::SUI",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully lent 1 SUI into Alphalend protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
    tokenAddress: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: ILendingParams = {
      type: "LENDING",
      amount: input.amount,
      symbol: input.symbol,
      tokenAddress: input.tokenAddress,
    };

    const result = await lending_alphalend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default lendingAlphalend;
