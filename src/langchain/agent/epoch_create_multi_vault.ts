import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { epoch_create_multi_vault } from "../../tools/epoch";

export class SuiEpochCreateMultiVaultTool extends Tool {
  name = "sui_epoch_create_multi_vault";
  description = `Create a time-locked token vesting vault on Sui with multiple beneficiaries using the Epoch protocol.
Each beneficiary receives a percentage share of the total locked amount. All shares must sum to 100.
Use this when asked to "distribute tokens to a team", "vest tokens for multiple wallets", or "create a team vesting schedule".

Input is a JSON string with fields:
- tokenType (string, required): Full Sui coin type, e.g. "0x2::sui::SUI"
- amount (string, required): Total amount in human-readable units, e.g. "10000000"
- beneficiaries (array, required): List of { address: string, sharePct: number } — must sum to 100
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
      const result = await epoch_create_multi_vault(this.suiKit, params);
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
