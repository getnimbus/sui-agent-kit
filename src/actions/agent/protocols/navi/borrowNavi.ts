import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IBorrowParams } from "../../../../types/farming";
import { borrow_navi } from "../../../../tools/navi";

const borrowNavi: Action = {
  name: "BORROW_NAVI",
  similes: ["borrow navi", "borrow from navi", "navi borrow", "borrow LST"],
  description: "Borrow tokens from Navi protocol",
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
        explanation: "Successfully borrow 1 SUI from Navi protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    collateral: z.string(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IBorrowParams = {
      type: "BORROW",
      amount: input.amount,
      collateral: input.collateral,
    };

    const result = await borrow_navi(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default borrowNavi;
