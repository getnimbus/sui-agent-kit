import { Action } from "../../types/action";
import { SuiAgentKit } from "../../agent";
import { z } from "zod";
import { register_sns } from "../../tools/sns/register";

const registerSns: Action = {
  name: "REGISTER_SNS",
  similes: ["register sns", "register domain", "buy domain", "register name"],
  description: "Register a Sui Name Service (SNS) domain",
  examples: [
    [
      {
        input: {
          name: "mydomain",
          years: 1,
          payToken: "SUI",
        },
        output: {
          status: "success",
          result: {
            tx_hash: "5JvBtQveYFsZFYxXMfSxYzUJgzGfyRgkH9YuZxpvuR9Y",
            tx_status: "success",
          },
        },
        explanation: "Successfully registered 'mydomain.sui' for 1 year",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(1),
    years: z.number().int().positive().min(1),
    payToken: z.enum(["SUI", "USDC", "NS"]),
  }),
  handler: async (agent: SuiAgentKit, input: Record<string, any>) => {
    const result = await register_sns(
      agent,
      input.name,
      input.years,
      input.payToken,
    );

    return {
      status: "success",
      result,
    };
  },
};

export default registerSns;
