import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiRegisterSnsTool extends Tool {
  name = "sui_register_sns";
  description = `Register a Sui Name Service (SNS) domain.

  Inputs (input is a JSON string):
  name: string - The domain name to register (without .sui suffix)
  years: integer - Number of years to register for
  payToken: string - Token symbol to pay with ("SUI", "USDC", "NS")`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.suiKit.registerSns(
        parsedInput.name,
        parsedInput.years,
        parsedInput.payToken,
      );
      return JSON.stringify({
        status: "success",
        result: {
          tx_hash: result.tx_hash,
          tx_status: result.tx_status,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
