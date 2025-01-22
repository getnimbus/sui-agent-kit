import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { get_stake } from "../../tools/sui/defi/stake/get_stake";

const getStake: Action = {
  name: "GET_STAKE",
  similes: ["get stake", "check stake", "view stake", "show stake"],
  description: "Get all staked SUI of the agent's wallet",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          result: [
            {
              validatorAddress:
                "0x27af083bac1ff487317fe82a6cf968d88d459f9ef95813b83dd8b81322a2ed71",
              stakingPool:
                "0x27af083bac1ff487317fe82a6cf968d88d459f9ef95813b83dd8b81322a2ed71",
              stakes: [
                {
                  principal: "1000000000",
                  stakeActiveEpoch: "651",
                  stakeRequestEpoch: "651",
                  stakedSuiId:
                    "0xf3ef91c45a640d695fefe69be34a6136aac88c9099ffdc16ed9920d84f3b261c",
                  status: "Pending",
                },
              ],
            },
          ],
        },
        // TODO: Add explanation
        explanation: "",
      },
    ],
  ],
  schema: z.object({}), // No input parameters needed
  handler: async (agent: SuiAgentKit) => {
    const result = await get_stake(agent);

    return {
      status: "success",
      result,
    };
  },
};

export default getStake;
