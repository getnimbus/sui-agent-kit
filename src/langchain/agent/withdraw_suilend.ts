import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { IUnstakingParams } from "../../types/farming";

export class SuiWithDrawSuilendTool extends Tool {
  name = "sui_withdraw_suilend";
  description = `Withdraw tokens from Suilend protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to withdraw, positive number, real number (required)
  symbol: string - The token symbol to withdraw (required, e.g., "sSUI")`;

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
      };

      const result = await this.suiKit.withdrawSuilend(params);
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
