import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { transfer_token } from "../../tools/sui/token/transfer_token";

const transferToken: Action = {
  name: "TRANSFER_TOKEN",
  similes: ["transfer token", "transfer", "token"],
  description: "Transfer token to the specified address",
  examples: [
    [
      {
        input: {
          token_symbol: "USDT",
          to: "0x8a145bee0c65a39abba64438357c04508ae68d5c1799f965457cd8438e3c9ad1",
          amount: 100,
        },
        output: {
          status: "success",
          result: {
            tx_hash: "APahTqoSQPJ5Tc4MfjRN6m5JwuoSgKyRAiVDbGfxwLRd",
            tx_status: "success",
          },
        },
        explanation:
          "The transaction hash is APahTqoSQPJ5Tc4MfjRN6m5JwuoSgKyRAiVDbGfxwLRd",
      },
    ],
  ],
  schema: z.object({
    token_symbol: z.string(),
    to: z.string(),
    amount: z.number().gt(0),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await transfer_token(
      agent,
      input.token_symbol,
      input.to,
      input.amount,
    );

    return {
      status: "success",
      result,
    };
  },
};

export default transferToken;
