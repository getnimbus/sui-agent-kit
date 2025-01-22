import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { stake } from "../../tools/sui/defi/stake/stake";

const stakeToken: Action = {
  name: "STAKE_TOKEN",
  similes: ["stake", "stake token", "stake sui"],
  description: "Stake SUI tokens to a validator pool",
  examples: [
    [
      {
        input: {
          amount: 1,
          poolId:
            "0x27af083bac1ff487317fe82a6cf968d88d459f9ef95813b83dd8b81322a2ed71",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation:
          "Successfully staked 1 SUI to validator pool 0x27af...ed71. Transaction hash: 5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().min(1),
    poolId: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await stake(agent, input.amount, input.poolId);

    return {
      status: "success",
      result,
    };
  },
};

export default stakeToken;
