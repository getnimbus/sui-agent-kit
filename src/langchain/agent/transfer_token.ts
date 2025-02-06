import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiTransferTokenTool extends Tool {
  name = "sui_transfer_token";
  description = `Transfer tokens or SUI to another address ( also called as wallet address ).

  Inputs ( input is a JSON string ):
  token_symbol: string, eg "SUI" or "sbETH" (required)
  to: string, eg "0xac5bceec1b789ff840d7d4e6ce4ce61c90d190a7f8c4f4ddf0bff6ee2413c33c" (required)
  amount: number, eg 1 (required)`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const tx_hash = await this.suiKit.transferToken(
        parsedInput.token_symbol,
        parsedInput.to,
        parsedInput.amount,
      );
      return JSON.stringify({
        status: "success",
        tx_hash,
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
