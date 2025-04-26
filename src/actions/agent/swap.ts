import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { swap } from "../../tools/sui/token/swap";
import { ISwapParams } from "../../types";

const swapToken: Action = {
  name: "SWAP_TOKEN",
  similes: ["swap", "swap token", "exchange token", "trade token"],
  description:
    "Swap tokens using either 7k protocol (default) or FlowX aggregator",
  examples: [
    [
      {
        input: {
          fromToken: "0x2::sui::SUI",
          toToken:
            "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
          inputAmount: 10,
          slippage: 0.01,
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation:
          "Successfully swapped 10 SUI for USDC with 1% slippage using default 7k protocol",
      },
      {
        input: {
          fromToken: "MIU",
          toToken: "USDC",
          inputAmount: 10,
          slippage: 0.01,
          aggregator: "flowx",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation:
          "Successfully swapped 10 MIU for USDC with 1% slippage using FlowX aggregator",
      },
    ],
  ],
  schema: z.object({
    fromToken: z.string(),
    toToken: z.string(),
    inputAmount: z.number().positive(),
    slippage: z.number().min(0).max(1).optional(),
    aggregator: z.string().optional(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: ISwapParams = {
      fromToken: input.fromToken,
      toToken: input.toToken,
      inputAmount: input.inputAmount,
      slippage: input.slippage,
      aggregator: input.aggregator || "7k",
    };
    const result = await swap(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default swapToken;
