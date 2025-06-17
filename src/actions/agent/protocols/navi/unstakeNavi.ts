import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IUnstakingParams } from "../../../../types/farming";
import { unstake_navi } from "../../../../tools/navi";

const unstakeNavi: Action = {
  name: "UNSTAKE_NAVI",
  similes: ["unstake navi", "unstake from navi", "navi unstake", "unstake LST"],
  description: "Unstake tokens from Navi protocol",
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
        explanation: "Successfully unstaked 1 SUI from Navi protocol",
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

    const result = await unstake_navi(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default unstakeNavi;
