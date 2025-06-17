import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { IStakingParams } from "../../../../types/farming";

export class SuiStakeAlphafiTool extends Tool {
  name = "sui_stake_alphafi";
  description = `Stake tokens into Alphafi protocol by SUI.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to stake out, positive number, real number (required)
  symbol: string - The token symbol to stake out by SUI (required, e.g., "sSUI", "mSUI", "fudSUI", "kSUI", "trevinSUI", "upSUI")
  poolId: string - The pool ID to stake out (required, e.g., "0xd013a1a0c6f2bad46045e3a1ba05932b4a32f15864021d7e0178d5c2fdcc85e3",)
  isSinglePool: boolean - Whether to stake out in single pool (required, e.g., true, false)`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const params: IStakingParams = {
        type: "STAKING",
        amount: parsedInput.amount,
        symbol: parsedInput.symbol,
        poolId: parsedInput.poolId,
        isSinglePool: parsedInput.isSinglePool,
      };

      const result = await this.suiKit.stakeAlphafi(params);
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
