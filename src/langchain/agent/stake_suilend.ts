import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { IStakingParams } from "../../types/farming";

export class SuiStakeSuilendTool extends Tool {
  name = "sui_stake_suilend";
  description = `Stake tokens into Suilend protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to stake (must be positive and not specified minimum amount)
  symbol: string - The token symbol to stake (e.g., "sSUI")
  isStakeAndDeposit: boolean - When user want to deposit, set to true (optional)`;

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
        isStakeAndDeposit: parsedInput.isStakeAndDeposit,
        poolId: "",
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
