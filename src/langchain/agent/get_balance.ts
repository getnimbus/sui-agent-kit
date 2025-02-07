import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiGetHoldingTool extends Tool {
  name = "sui_get_holding";
  description = `Get all assets in the agent's wallet, also is user's wallet and response in table markdown format`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      const assets = await this.suiKit.getHoldings();
      return JSON.stringify({
        status: "success",
        assets,
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
