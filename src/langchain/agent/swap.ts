import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { ISwapParams } from "../../types";

export class SuiSwapTool extends Tool {
  name = "sui_swap";
  description = `Swap tokens.

  Inputs (input is a JSON string):
  fromToken: string - The token address to swap from (e.g. "0x2::sui::SUI") (required)
  toToken: string - The token address to swap to (required)
  inputAmount: number - Amount of input token to swap (required)
  slippage: number - Slippage tolerance (e.g., 0.01 for 1%) (optional)`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input) as ISwapParams;
    try {
      const result = await this.suiKit.swap(parsedInput);
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
