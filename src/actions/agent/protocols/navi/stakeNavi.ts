import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { staking_navi } from "../../../../tools/navi";
import { IStakingParams } from "../../../../types/farming";

const stakeNavi: Action = {
  name: "STAKE_NAVI",
  similes: ["stake navi", "stake to navi", "navi stake", "stake LST"],
  description: "Stake tokens into Navi protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "sSUI",
          tokenAddress: "0x2::sui::SUI",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully staked 1 SUI into Navi protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
    tokenAddress: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IStakingParams = {
      type: "STAKING",
      amount: input.amount,
      symbol: input.symbol,
      tokenAddress: input.tokenAddress,
    };

    const result = await staking_navi(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default stakeNavi;
