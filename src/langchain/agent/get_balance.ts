import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiGetHoldingTool extends Tool {
  name = "sui_get_holding";
  description = `Get all assets in the agent's wallet`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      return JSON.stringify({
        status: "success",
        assets: await this.suiKit.getHoldings(),
      });
    } catch (error) {
      throw new Error("Failed to get holdings");
    }
  }
}
