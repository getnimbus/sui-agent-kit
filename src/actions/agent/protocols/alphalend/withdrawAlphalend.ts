import { Action } from "../../../../types/action";
import { SuiAgentKit } from "../../../../agent";
import { z } from "zod";
import { IWithdrawParams } from "../../../../types/farming";
import { withdraw_alphalend } from "../../../../tools/alphalend";

const withdrawAlphalend: Action = {
  name: "WITHDRAW_ALPHALEND",
  similes: [
    "withdraw alphalend",
    "withdraw from alphalend",
    "alphalend withdraw",
    "withdraw LST",
  ],
  description: "Withdraw tokens from Alphalend protocol",
  examples: [
    [
      {
        input: {
          amount: 1,
          symbol: "sSUI",
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
        explanation: "Successfully withdraw 1 SUI from Alphalend protocol",
      },
    ],
  ],
  schema: z.object({
    amount: z.number().positive(),
    symbol: z.string(),
    tokenAddress: z.string(),
    listCoinTypeInPosition: z.array(z.string()),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: IWithdrawParams = {
      type: "LENDING_WITHDRAW",
      amount: input.amount,
      symbol: input.symbol,
      tokenAddress: input.tokenAddress,
      listCoinTypeInPosition: input.listCoinTypeInPosition,
    };

    const result = await withdraw_alphalend(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default withdrawAlphalend;
