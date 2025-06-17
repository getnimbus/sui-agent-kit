import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { ILendingParams } from "../../../../types/farming";

export class SuiLendingAlphalendTool extends Tool {
  name = "sui_lending_alphalend";
  description = `Lend tokens into Alphalend protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to lend, positive number, real number (required)
  symbol: string - The token symbol to lend (required, e.g., "SUI", "USDC")
  tokenAddress: string - The token address to lend (required, e.g., "0x2::sui::SUI", "0x2::usdc::USDC")`;

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
        tokenAddress: parsedInput.tokenAddress,
      };

      const result = await this.suiKit.lendingAlphalend(params);
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
