import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../../../agent";
import { IRepayParams } from "../../../../types/farming";

export class SuiRepayAlphalendTool extends Tool {
  name = "sui_replay_alphalend";
  description = `Repay tokens into Alphalend protocol.

  Inputs (input is a JSON string):
  amount: number - The amount of tokens to repay, positive number, real number (required)
  collateral: string - The collateral token address to repay (required, e.g., "0x2::sui::SUI", "0x2::usdc::USDC")
  tokenAddress: string - The token address to repay (required, e.g., "0x2::sui::SUI", "0x2::usdc::USDC")
  listCoinTypeInPosition: string[] - The list of coin types to repay (required, e.g., ["0x2::sui::SUI", "0x2::usdc::USDC"])`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const params: IRepayParams = {
        type: "REPAY",
        amount: parsedInput.amount,
        collateral: parsedInput.collateral,
        tokenAddress: parsedInput.tokenAddress,
        listCoinTypeInPosition: parsedInput.listCoinTypeInPosition,
      };

      const result = await this.suiKit.repayAlphalend(params);
      return JSON.stringify({
        status: "success",
        result: {
          tx_hash: result.tx_hash,
          tx_status: result.tx_status,
        },
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
