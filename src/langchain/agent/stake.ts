import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiStakeTool extends Tool {
  name = "sui_stake";
  description = `Stake SUI tokens to a validator pool.

  Inputs (input is a JSON string):
  amount: number - The amount of SUI to stake (minimum 1 SUI)
  poolId: string - The validator pool ID to stake to`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const result = await this.suiKit.stake(
        parsedInput.amount,
        parsedInput.poolId,
      );
      return JSON.stringify({
        status: "success",
        ...result,
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
