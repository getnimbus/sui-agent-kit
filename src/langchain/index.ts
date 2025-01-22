export * from "./agent";

import { SuiAgentKit } from "../agent";
import { SuiDeployTokenTool } from "./agent/deploy_token";
import { SuiGetHoldingTool } from "./agent/get_balance";
import { SuiTransferTokenTool } from "./agent/transfer_token";
import { SuiCreateImageTool } from "./index";
import { SuiStakeTool } from "./agent/stake";
import { SuiGetStakeTool } from "./agent/get_stake";
import { SuiUnstakeTool } from "./agent/unstake";
import { SuiGetWalletAddressTool } from "./agent/get_wallet_address";

export function createSuiTools(suiKit: SuiAgentKit) {
  return [
    new SuiGetWalletAddressTool(suiKit),
    new SuiCreateImageTool(suiKit),
    new SuiGetHoldingTool(suiKit),
    new SuiTransferTokenTool(suiKit),
    new SuiDeployTokenTool(suiKit),
    new SuiStakeTool(suiKit),
    new SuiGetStakeTool(suiKit),
    new SuiUnstakeTool(suiKit),
  ];
}
