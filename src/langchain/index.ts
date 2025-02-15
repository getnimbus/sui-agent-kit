export * from "./agent";

import { SuiAgentKit } from "../agent";
import {
  // SuiCreateImageTool,
  SuiGetWalletAddressTool,
  SuiGetHoldingTool,
  SuiTransferTokenTool,
  SuiDeployTokenTool,
  SuiStakeTool,
  SuiGetStakeTool,
  SuiUnstakeTool,
  SuiCreatePoolCetusCLMMTool,
  SuiSwapTool,
  SuiRegisterSnsTool,
  SuiGetSnsNameRecordTool,
  SuiStakeSuilendTool,
  SuiWithDrawSuilendTool,
  SuiLendingSuilendTool,
  SuiGetVaultsTool,
} from "./agent";

export function createSuiTools(suiKit: SuiAgentKit) {
  return [
    // new SuiCreateImageTool(suiKit),
    new SuiGetWalletAddressTool(suiKit),
    new SuiGetHoldingTool(suiKit),
    new SuiTransferTokenTool(suiKit),
    new SuiDeployTokenTool(suiKit),
    new SuiStakeTool(suiKit),
    new SuiGetStakeTool(suiKit),
    new SuiUnstakeTool(suiKit),
    new SuiCreatePoolCetusCLMMTool(suiKit),
    new SuiSwapTool(suiKit),
    new SuiRegisterSnsTool(suiKit),
    new SuiGetSnsNameRecordTool(suiKit),
    new SuiStakeSuilendTool(suiKit),
    new SuiWithDrawSuilendTool(suiKit),
    new SuiLendingSuilendTool(suiKit),
    new SuiGetVaultsTool(suiKit),
  ];
}
