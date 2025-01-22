import { Tool } from "langchain/tools";
import { SuiAgentKit } from "../../agent";

export class SuiUnstakeTool extends Tool {
  name = "sui_unstake";
  description = `Unstake SUI tokens from a validator pool.

  Inputs (input is a JSON string):
  id: string - The ID of the staked SUI object to unstake
  stake_object_id: string - The ID of staked object
  stake_activation_epoch: number - The epoch at which the stake was activated
  principal: string - The amount of SUI to unstake`;

  constructor(private suiKit: SuiAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    const parsedInput = JSON.parse(input);
    try {
      const result = await this.suiKit.unstake({
        id: parsedInput.id,
        stake_object_id: parsedInput.stake_object_id,
        stake_activation_epoch: parsedInput.stake_activation_epoch,
        principal: parsedInput.principal,
      });
      return JSON.stringify({
        status: "success",
        result: {
          tx_hash: result.tx_hash,
          tx_status: result.tx_status,
        },
      });
    } catch (error) {
      throw new Error("Failed to unstake SUI");
    }
  }
}
