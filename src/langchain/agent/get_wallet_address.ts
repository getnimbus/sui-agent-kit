import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiGetWalletAddressTool extends Tool {
  name = "sui_get_wallet_address";
  description = `Get the user's wallet address, the wallet is already set when init, do not ask user's wallet again`;

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
