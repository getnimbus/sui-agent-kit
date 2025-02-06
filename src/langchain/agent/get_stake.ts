import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiGetStakeTool extends Tool {
  name = "sui_get_stake";
  description = `Get all staked SUI tokens and their validator pools for the agent's wallet`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      const stakes = await this.suiKit.getStake();
      return JSON.stringify({
        status: "success",
        result: stakes,
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
