import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IUnstakingParams } from "../../../../types/farming";
import { unstake_alphafi } from "../../../../tools/alphafi";

const unstakeAlphafi: Action = {
  name: "UNSTAKE_ALPHAFI",
  similes: [
    "unstake alphafi",
    "unstake from alphafi",
    "alphafi unstake",
    "unstake LST",
  ],
  description: "Unstake tokens from Alphafi protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "sSUI",
          positionId: "0x1",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation:
          "Successfully unstaked 1 sSUI from Alphafi protocol with positionId 0x1",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
    positionId: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IUnstakingParams = {
      type: "UNSTAKING",
      amount: input.amount,
      symbol: input.symbol,
      positionId: input.positionId,
    };

    const result = await unstake_alphafi(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default unstakeAlphafi;
