import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiGetSnsNameRecordTool extends Tool {
  name = "sui_get_sns_name_record";
  description = `Get information about a registered Sui Name Service (SNS) domain.

  Inputs (input is a string): The domain name to look up
  
  The output response have expirationTimestampMs in milliseconds, convert it to human readable format
  - the time human readable will be display main
  - the time in miliseconds put in the parentheses
  
  `;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const result = await this.suiKit.getSnsNameRecord(input);
      return JSON.stringify({
        status: "success",
        result,
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
