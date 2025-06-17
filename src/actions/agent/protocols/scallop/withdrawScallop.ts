import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IWithdrawParams } from "../../../../types/farming";
import { withdraw_scallop } from "../../../../tools/scallop";

const withdrawScallop: Action = {
  name: "WITHDRAW_SCALLOP",
  similes: [
    "withdraw scallop",
    "withdraw from scallop",
    "scallop withdraw",
    "withdraw LST",
  ],
  description: "Withdraw tokens from Scallop protocol",
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
        explanation: "Successfully withdraw 1 SUI from Scallop protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IWithdrawParams = {
      type: "LENDING_WITHDRAW",
      amount: input.amount,
      symbol: input.symbol,
    };

    const result = await withdraw_scallop(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default withdrawScallop;
