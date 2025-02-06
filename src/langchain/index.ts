export * from "./agent";

import { SuiAgentKit } from "../agent";
import {
  SuiGetWalletAddressTool,
  SuiCreateImageTool,
  SuiGetHoldingTool,
  SuiTransferTokenTool,
  SuiDeployTokenTool,
  SuiStakeTool,
  SuiGetStakeTool,
  SuiUnstakeTool,
  SuiCreatePoolCetusCLMMTool,
  SuiSwapTool,
} from "./agent";

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
    new SuiCreatePoolCetusCLMMTool(suiKit),
    new SuiSwapTool(suiKit),
  ];
}
