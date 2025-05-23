import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { ILendingParams } from "../../types/farming";

export class SuiLendingSuilendTool extends Tool {
  name = "sui_lending_suilend";
  description = `Lend tokens into Suilend protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to lend, positive number, real number (required)
  symbol: string - The token symbol to lend (required, e.g., "SUI", "USDC")`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const params: ILendingParams = {
        type: "LENDING",
        amount: parsedInput.amount,
        symbol: parsedInput.symbol,
      };

      const result = await this.suiKit.lendingSuilend(params);
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
