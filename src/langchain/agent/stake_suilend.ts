import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { IStakingParams } from "../../types/farming";

export class SuiStakeSuilendTool extends Tool {
  name = "sui_stake_suilend";
  description = `Stake tokens into Suilend protocol by SUI.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to stake out, positive number, real number (required)
  symbol: string - The token symbol to stake out by SUI (required, e.g., "sSUI", "mSUI", "fudSUI", "kSUI", "trevinSUI", "upSUI")`;

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
      };

      const result = await this.suiKit.stakeSuilend(params);
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
