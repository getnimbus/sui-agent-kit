import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { IWithdrawParams } from "../../../../types/farming";

export class SuiWithDrawAlphalendTool extends Tool {
  name = "sui_withdraw_alphalend";
  description = `Withdraw tokens from Alphalend protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to withdraw, positive number, real number (required)
  symbol: string - The token symbol to withdraw (required, e.g., "sSUI")
  tokenAddress: string - The token address to withdraw (required, e.g., "0x2::sui::SUI", "0x2::usdc::USDC")
  listCoinTypeInPosition: string[] - The list of coin types to withdraw (required, e.g., ["0x2::sui::SUI", "0x2::usdc::USDC"])`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const params: IWithdrawParams = {
        type: "LENDING_WITHDRAW",
        amount: parsedInput.amount,
        symbol: parsedInput.symbol,
        tokenAddress: parsedInput.tokenAddress,
        listCoinTypeInPosition: parsedInput.listCoinTypeInPosition,
      };

      const result = await this.suiKit.withdrawAlphalend(params);
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
