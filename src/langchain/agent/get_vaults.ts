import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { VaultAPR, VaultTVL, VaultType, VaultTags } from "../../types";

export class SuiGetVaultsTool extends Tool {
  name = "sui_get_vaults";
  description = `Retrieve information about SUI vaults. If the user does not provide any filters, apply default values.

  Inputs (JSON string)
  address (string, optional, default: "")
  order (string, optional, default: "tvl")
  sort (string, optional, default: "desc"): Enum: "asc", "desc".
  limit (number, optional, default: 10)
  offset (number, optional, default: 0)
  protocol (string, optional, default: "")
  type (string, optional, default: ""): Enum: "LP", "VAULT", "STAKING", "LENDING".
  tvl (string, optional, default: ""): Enum: "< 100k", "100k - 500k", "500k - 1M", "> 1M".
  apr (string, optional, default: ""): Enum: "< 5%", "5% - 25%", "25% - 50%", "> 50%".
  tags (string[], optional, default: []): Enum: "stable_yield", "low_risk", "high_risk_high_return", "airdrop".

  Output Format
  The response must be in markdown table format.
  The table should highlight key insights that help the user choose the best vault for investment, considering the provided filters.`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Add input validation
      if (!input || input.trim() === "") {
        // Handle empty input by using default values
        const result = await this.suiKit.getVaults({
          address: "",
          order: "tvl",
          sort: "desc",
          limit: 10,
          offset: 0,
          protocol: "",
          type: VaultType.EMPTY,
          tvl: VaultTVL.EMPTY,
          apr: VaultAPR.EMPTY,
          tags: [],
        });

        return this.formatResponse(result);
      }

      // Parse and validate JSON input
      let parsedInput;
      try {
        parsedInput = JSON.parse(input);
      } catch (parseError) {
        return JSON.stringify({
          status: "error",
          message: "Invalid JSON input. Please provide a valid JSON string.",
          code: "INVALID_JSON",
        });
      }

      const result = await this.suiKit.getVaults({
        address: parsedInput.address || "",
        order: parsedInput.order || "tvl",
        sort: parsedInput.sort || "desc",
        limit: parsedInput.limit || 10,
        offset: parsedInput.offset || 0,
        protocol: parsedInput.protocol || "",
        type: parsedInput.type || "",
        tvl: parsedInput.tvl || "",
        apr: parsedInput.apr || "",
        tags: parsedInput.tags || [],
      });

      return this.formatResponse(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message || "An unknown error occurred",
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }

  private formatResponse(result: any): string {
    return JSON.stringify(
      {
        status: "success",
        result,
      },
      null,
      2,
    ); // Added pretty printing with 2 spaces
  }
}
