import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { create_pool_cetus_CLMM } from "../../tools/cetus/create_pool_CLMM";
import { ICreatePoolCLMMParams } from "../../types";

const createPoolCetusCLMM: Action = {
  name: "CREATE_POOL_CETUS_CLMM",
  similes: [
    "create pool clmm",
    "create liquidity pool clmm",
    "create cetus pool clmm",
    "add liquidity clmm",
  ],
  description:
    "Create a new Cetus CLMM (Concentrated Liquidity Market Maker) pool",
  examples: [
    [
      {
        input: {
          coinTypeA:
            "0x92aad4e078dded45773628adc3a9977d546b178bdadabcae351ce1818c5bb1fb::sc::SC",
          coinTypeB: "0x2::sui::SUI",
          initializePrice: 1,
          tickSpacing: 10,
          inputTokenAmount: 1,
          isTokenAInput: true,
          slippage: 0.07,
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully created a Cetus CLMM pool with SC/SUI pair",
      },
    ],
  ],
  schema: z.object({
    coinTypeA: z.string(),
    coinTypeB: z.string(),
    initializePrice: z.number().positive(),
    tickSpacing: z
      .enum(["2", "10", "20", "60", "200", "220"])
      .transform(Number),
    inputTokenAmount: z.number().positive(),
    isTokenAInput: z.boolean(),
    slippage: z.number().min(0).max(1).optional(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const params: ICreatePoolCLMMParams = {
      coinTypeA: input.coinTypeA,
      coinTypeB: input.coinTypeB,
      initializePrice: input.initializePrice,
      tickSpacing: input.tickSpacing,
      inputTokenAmount: input.inputTokenAmount,
      isTokenAInput: input.isTokenAInput,
      slippage: input.slippage,
    };
    const result = await create_pool_cetus_CLMM(agent, params);

    return {
      status: "success",
      result,
    };
  },
};

export default createPoolCetusCLMM;
