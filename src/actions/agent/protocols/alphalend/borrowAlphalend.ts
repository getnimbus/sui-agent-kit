import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IBorrowParams } from "../../../../types/farming";
import { borrow_alphalend } from "../../../../tools/alphalend";

const borrowAlphalend: Action = {
  name: "BORROW_ALPHALEND",
  similes: [
    "borrow alphalend",
    "borrow from alphalend",
    "alphalend borrow",
    "borrow LST",
  ],
  description: "Borrow tokens into Alphalend protocol",
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
        explanation: "Successfully borrow 1 SUI from Alphalend protocol",
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
    const params: IBorrowParams = {
      type: "BORROW",
      amount: input.amount,
      collateral: input.collateral,
      tokenAddress: input.tokenAddress,
      listCoinTypeInPosition: input.listCoinTypeInPosition,
    };

    const result = await borrow_alphalend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default borrowAlphalend;
