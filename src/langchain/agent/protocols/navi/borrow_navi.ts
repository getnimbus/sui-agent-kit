import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { IBorrowParams } from "../../../../types/farming";

export class SuiBorrowNaviTool extends Tool {
  name = "sui_borrow_navi";
  description = `Borrow tokens from Navi protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to borrow, positive number, real number (required)
  collateral: string - The collateral token address to borrow (required, e.g., "0x2::sui::SUI", "0x2::usdc::USDC")`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const params: IBorrowParams = {
        type: "BORROW",
        amount: parsedInput.amount,
        collateral: parsedInput.collateral,
      };

      const result = await this.suiKit.borrowNavi(params);
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
