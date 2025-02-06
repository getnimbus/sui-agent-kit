import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { ICreatePoolCLMMParams } from "../../types";

export class SuiCreatePoolCetusCLMMTool extends Tool {
  name = "sui_create_pool_cetus_clmm";
  description = `Create a new Cetus CLMM (Concentrated Liquidity Market Maker) pool.

  Inputs (input is a JSON string):
  coinTypeA: string - The coin type for token A (required)
  coinTypeB: string - The coin type for token B (required)
  initializePrice: number - Initial price ratio between tokens (required)
  tickSpacing: number - Must be one of: 2, 10, 20, 60, 200, 220 (required)
  inputTokenAmount: number - Amount of input token to add as liquidity (required)
  isTokenAInput: boolean - Whether token A is the input token (required)
  slippage: number - Slippage tolerance (e.g., 0.05 for 5%) (optional)`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input) as ICreatePoolCLMMParams;
      const result = await this.suiKit.createPoolCetusCLMM(parsedInput);
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
