import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { epoch_claim_vault } from "../../tools/epoch";

export class SuiEpochClaimVaultTool extends Tool {
  name = "sui_epoch_claim_vault";
  description = `Claim unlocked tokens from an Epoch vesting vault on Sui.
Works for both single-beneficiary and multi-beneficiary vaults.
Use this when asked to "claim vested tokens", "withdraw from vault", or "collect unlocked tokens".

Input is a JSON string with fields:
- vaultId (string, required): Epoch vault object ID (0x...)
- tokenType (string, required): Coin type of the vault, e.g. "0x2::sui::SUI"
- isMulti (boolean, optional): Set to true for multi-beneficiary vaults. Default: false`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const { vaultId, tokenType, isMulti } = JSON.parse(input);
      const result = await epoch_claim_vault(this.suiKit, vaultId, tokenType, isMulti ?? false);
      return JSON.stringify({
        status: "success",
        digest: result.digest,
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
