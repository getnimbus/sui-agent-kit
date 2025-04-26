import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { ISwapParams } from "../../types";
import { COIN_MAPPING } from "../../tools/sui/token/swap";

export class SuiSwapTool extends Tool {
  name = "sui_swap";
  description = `Swap tokens from pair address or symbol.
  Some common tokens are: ${Array.from(COIN_MAPPING.keys()).join(", ")}

  Inputs (input is a JSON string):
  fromToken: string - The token address or symbol to swap from (e.g. "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC" or "USDC") (required)
  toToken: string - The token address or symbol to swap to (e.g. "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS" or "CETUS") (required)
  inputAmount: number - Amount of input token to swap (required)
  slippage: number - Slippage tolerance (e.g., 0.01 for 1%) (optional)
  aggregator: string - The aggregator to use for swapping. Supports "7k" or "flowx" (optional, defaults to "7k")`;

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
