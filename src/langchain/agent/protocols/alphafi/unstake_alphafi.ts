import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { IUnstakingParams } from "../../../../types/farming";

export class SuiUnstakeAlphafiTool extends Tool {
  name = "sui_unstake_alphafi";
  description = `Unstake tokens from Alphafi protocol by SUI.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to unstake out, positive number, real number (required)
  symbol: string - The token symbol to unstake out by SUI (required, e.g., "sSUI", "mSUI", "fudSUI", "kSUI", "trevinSUI", "upSUI")
  positionId: string - The position ID to stake out (required, e.g., "0xd013a1a0c6f2bad46045e3a1ba05932b4a32f15864021d7e0178d5c2fdcc85e3",)`;

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
        positionId: parsedInput.positionId,
      };

      const result = await this.suiKit.unstakeAlphafi(params);
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
