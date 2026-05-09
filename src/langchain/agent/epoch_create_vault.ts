import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { epoch_create_vault } from "../../tools/epoch";

export class SuiEpochCreateVaultTool extends Tool {
  name = "sui_epoch_create_vault";
  description = `Create a time-locked token vesting vault on Sui using the Epoch protocol.
Locks tokens for a single beneficiary with a customizable cliff + linear vesting schedule.
Use this when asked to "vest tokens", "create a vesting schedule", or "lock tokens for an address".

Input is a JSON string with fields:
- tokenType (string, required): Full Sui coin type, e.g. "0x2::sui::SUI"
- amount (string, required): Amount in human-readable units, e.g. "1000000"
- beneficiary (string, required): Recipient SUI wallet address
- endDate (string, required): Vesting end date as ISO string, e.g. "2027-12-31"
- cliffDate (string, optional): Cliff unlock date as ISO string
- cliffPct (number, optional): Percentage released at cliff (0-100). Default: 0
- startDate (string, optional): Linear vesting start date as ISO string`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const result = await epoch_create_vault(this.suiKit, params);
      return JSON.stringify({
        status: "success",
        vaultId: result.vaultId,
        digest: result.digest,
        epochUrl: `https://epochsui.com/vault/${result.vaultId}`,
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
