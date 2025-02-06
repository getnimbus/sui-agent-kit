import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";
import { ICreateTokenForm } from "../../utils/move-template/coin";

export class SuiDeployTokenTool extends Tool {
  name = "sui_deploy_token";
  description = `Deploy a new token on the Sui blockchain.

  Inputs (input is a JSON string):
  name: string, the name of the token (required)
  symbol: string, the symbol/ticker of the token (required)
  decimals: number, number of decimal places (required)
  description: string, description of the token (optional)
  icon_url: string, URL to the token's icon (optional)
  total_supply: number, initial total supply of the token (required)
  fixed_supply: boolean, whether the supply is fixed (required)`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input);
    try {
      const form: ICreateTokenForm = {
        name: parsedInput.name,
        symbol: parsedInput.symbol,
        decimals: parsedInput.decimals,
        description: parsedInput.description,
        imageUrl: parsedInput.icon_url,
        totalSupply: parsedInput.total_supply,
        fixedSupply: parsedInput.fixed_supply,
      };

      const result = await this.suiKit.deployToken(form);
      return JSON.stringify({
        status: "success",
        tx_hash: result,
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
