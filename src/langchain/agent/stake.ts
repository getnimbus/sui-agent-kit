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
    const parsedInput = JSON.parse(input);
    try {
      const result = await this.suiKit.stake(
        parsedInput.amount,
        parsedInput.poolId,
      );
      return JSON.stringify({
        status: "success",
        ...result,
      });
    } catch (error) {
      throw new Error("Failed to stake SUI");
    }
  }
}
