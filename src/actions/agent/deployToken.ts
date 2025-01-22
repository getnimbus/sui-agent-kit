import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { deploy_token } from "../../tools/sui/token/deploy_token";
import { ICreateTokenForm } from "../../utils/move-template/coin";

const deployToken: Action = {
  name: "DEPLOY_TOKEN",
  similes: ["deploy token", "deploy", "token"],
  description:
    "Receive token name, symbol, total supply, description, image url, decimals, and deploy token to the specified address",
  examples: [
    [
      {
        input: {
          name: "SiameseCat",
          symbol: "SC",
          totalSupply: "10000000",
          description: "Siamese Cat",
          imageUrl:
            "https://cdn-aahmh.nitrocdn.com/mwIJloVUffDtKiCgRcivopdgojcJrVwT/assets/images/optimized/rev-31cad3f/www.cozycatfurniture.com/image/Beautiful-Siamese-Cat.jpg",
          decimals: 9,
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
    name: z.string().trim(),
    symbol: z.string(),
    totalSupply: z.string().min(1),
    description: z.string(),
    imageUrl: z.string().optional(),
    decimals: z.number().gt(0).optional(),
    fixedSupply: z.boolean(),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const form: ICreateTokenForm = {
      name: input.name,
      symbol: input.symbol,
      totalSupply: input.totalSupply,
      description: input.description,
      imageUrl: input.imageUrl,
      decimals: input.decimals,
      fixedSupply: input.fixedSupply,
    };
    const result = await deploy_token(agent, form);

    return {
      status: "success",
      result,
    };
  },
};

export default deployToken;
