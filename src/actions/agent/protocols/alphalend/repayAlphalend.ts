import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IRepayParams } from "../../../../types/farming";
import { repay_alphalend } from "../../../../tools/alphalend";

const repayAlphalend: Action = {
  name: "REPAY_ALPHALEND",
  similes: [
    "repay alphalend",
    "repay to alphalend",
    "alphalend repay",
    "repay LST",
  ],
  description: "Repay tokens from Alphalend protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          collateral: "0x2::sui::SUI",
          tokenAddress: "0x2::sui::SUI",
          listCoinTypeInPosition: ["0x2::sui::SUI"],
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully repay 1 SUI from Alphalend protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    collateral: z.string(),
    tokenAddress: z.string(),
    listCoinTypeInPosition: z.array(z.string()),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IRepayParams = {
      type: "REPAY",
      amount: input.amount,
      collateral: input.collateral,
      tokenAddress: input.tokenAddress,
      listCoinTypeInPosition: input.listCoinTypeInPosition,
    };

    const result = await repay_alphalend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default repayAlphalend;
