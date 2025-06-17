import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { IUnstakingParams } from "../../../../types/farming";

export class SuiUnstakeNaviTool extends Tool {
  name = "sui_unstake_navi";
  description = `Unstake tokens from Navi protocol by SUI.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to unstake out, positive number, real number (required)
  symbol: string - The token symbol to unstake out by SUI (required, e.g., "sSUI", "mSUI", "fudSUI", "kSUI", "trevinSUI", "upSUI")`;

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

      const result = await this.suiKit.unstakeNavi(params);
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
