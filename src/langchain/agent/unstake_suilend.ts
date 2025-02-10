import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { IUnstakingParams } from "../../types/farming";

export class SuiUnstakeSuilendTool extends Tool {
  name = "sui_unstake_suilend";
  description = `Unstake tokens from Suilend protocol.

  Inputs (input is a JSON string):
  amount: real number - The amount of tokens to unstake (required, e.g 0.1, 0.01, 0.001, 1, ...)
  symbol: string - The token symbol to unstake (required, e.g., "sSUI")`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const params: IUnstakingParams = {
        type: "UNSTAKING",
        amount: parsedInput.amount,
        symbol: parsedInput.symbol,
        poolId: "",
      };

      const result = await this.suiKit.unstakeSuilend(params);
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
