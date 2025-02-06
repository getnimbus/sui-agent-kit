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
          stakedSuiId:
            "0xad30008634871e4b3a26634160c20edb1f04adda274ee51e671583c0142d2eec",
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
    stakedSuiId: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await unstake(agent, input.stakedSuiId);

    return {
      status: "success",
      result,
    };
  },
};

export default unstakeToken;
