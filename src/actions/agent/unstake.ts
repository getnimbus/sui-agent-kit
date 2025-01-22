import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { unstake } from "../../tools/sui/defi/stake/unstake";

const unstakeToken: Action = {
  name: "UNSTAKE_TOKEN",
  similes: ["unstake", "unstake token", "unstake sui", "withdraw stake"],
  description: "Unstake SUI tokens from a validator pool",
  examples: [
    [
      {
        input: {
          id: "0xf3ef91c45a640d695fefe69be34a6136aac88c9099ffdc16ed9920d84f3b261c",
          stake_object_id:
            "0x27af083bac1ff487317fe82a6cf968d88d459f9ef95813b83dd8b81322a2ed71",
          stake_activation_epoch: 651,
          principal: "1000000000",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "8KvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Z",
            tx_status: "success",
          },
        },
        explanation:
          "Successfully unstaked SUI from validator pool. Transaction hash: 8KvBt...uR9Z",
      },
    ],
  ],
  schema: z.object({
    id: z.string(),
    stake_object_id: z.string(),
    stake_activation_epoch: z.number(),
    principal: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await unstake(agent, {
      id: input.id,
      stake_object_id: input.stake_object_id,
      stake_activation_epoch: input.stake_activation_epoch,
      principal: input.principal,
    });

    return {
      status: "success",
      result,
    };
  },
};

export default unstakeToken;
