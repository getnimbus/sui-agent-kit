import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { stake_alphafi } from "../../../../tools/alphafi";
import { IStakingParams } from "../../../../types/farming";

const stakeAlphafi: Action = {
  name: "STAKE_ALPHAFI",
  similes: ["stake alphafi", "stake to alphafi", "alphafi stake", "stake LST"],
  description: "Stake tokens into Alphafi protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "sSUI",
          poolId: "0x1",
          isSinglePool: true,
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation:
          "Successfully staked 1 sSUI into Alphafi protocol with poolId 0x1 and isSinglePool true",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
    poolId: z.string(),
    isSinglePool: z.boolean(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IStakingParams = {
      type: "STAKING",
      amount: input.amount,
      symbol: input.symbol,
      poolId: input.poolId,
      isSinglePool: input.isSinglePool,
    };

    const result = await stake_alphafi(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default stakeAlphafi;
