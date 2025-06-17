import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IRepayParams } from "../../../../types/farming";
import { repay_navi } from "../../../../tools/navi";

const repayNavi: Action = {
  name: "REPAY_NAVI",
  similes: ["repay navi", "repay to navi", "navi repay", "repay LST"],
  description: "Repay tokens into Navi protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          collateral: "0x2::sui::SUI",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully repay 1 SUI into Navi protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    collateral: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IRepayParams = {
      type: "REPAY",
      amount: input.amount,
      collateral: input.collateral,
    };

    const result = await repay_navi(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default repayNavi;
