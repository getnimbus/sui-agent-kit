import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { epoch_get_vault_info } from "../../tools/epoch";

export class SuiEpochGetVaultInfoTool extends Tool {
  name = "sui_epoch_get_vault_info";
  description = `Fetch details about an Epoch vesting vault on Sui.
Returns token type, total locked amount, amount already claimed, vesting schedule (cliff + linear dates),
beneficiary address(es), and links to Epoch and SuiVision explorers.
Use this when asked to "check vault status", "how much is vested", "show vesting schedule", or "vault info".

Input is a JSON string with fields:
- vaultId (string, required): Epoch vault object ID (0x...)`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const { vaultId } = JSON.parse(input);
      const info = await epoch_get_vault_info(this.suiKit, vaultId);
      return JSON.stringify({ status: "success", ...info });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
