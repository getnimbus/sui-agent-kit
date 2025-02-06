import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiGetWalletAddressTool extends Tool {
  name = "sui_get_wallet_address";
  description = `Get the agent's wallet address`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      return JSON.stringify({
        status: "success",
        wallet_address: this.suiKit.getWalletAddress(),
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
