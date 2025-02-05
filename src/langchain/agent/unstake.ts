import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiUnstakeTool extends Tool {
  name = "sui_unstake";
  description = `Unstake SUI tokens from a validator pool.

  Inputs (input is a JSON string):
  stakedSuiId: string - The ID of the staked SUI object to unstake`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input);
    try {
      const result = await this.suiKit.unstake(parsedInput.stakedSuiId);
      return JSON.stringify({
        status: "success",
        result: {
          tx_hash: result.tx_hash,
          tx_status: result.tx_status,
        },
      });
    } catch (error) {
      throw new Error("Failed to unstake SUI");
    }
  }
}
