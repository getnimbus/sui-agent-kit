import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { staking_suilend } from "../../tools/suilend";
import { IStakingParams } from "../../types/farming";

const stakeSuilend: Action = {
  name: "STAKE_SUILEND",
  similes: ["stake suilend", "stake to suilend", "suilend stake", "stake LST"],
  description: "Stake tokens into Suilend protocol",
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
        explanation: "Successfully staked 1 sSUI into Suilend protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IStakingParams = {
      type: "STAKING",
      amount: input.amount,
      symbol: input.symbol,
    };

    const result = await staking_suilend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default stakeSuilend;
