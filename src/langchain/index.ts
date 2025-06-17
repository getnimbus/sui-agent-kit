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
  SuiGetVaultsTool,
  SuiStakeSuilendTool,
  SuiWithDrawSuilendTool,
  SuiUnstakeSuilendTool,
  SuiLendingSuilendTool,
  SuiBorrowSuilendTool,
  SuiRepaySuilendTool,
  SuiStakeAlphafiTool,
  SuiUnstakeAlphafiTool,
  SuiBorrowAlphalendTool,
  SuiRepayAlphalendTool,
  SuiWithDrawAlphalendTool,
  SuiLendingAlphalendTool,
  SuiWithDrawScallopTool,
  SuiLendingScallopTool,
  SuiRepayNaviTool,
  SuiBorrowNaviTool,
  SuiUnstakeNaviTool,
  SuiStakeNaviTool,
} from "./agent";

export function createSuiTools(suiKit: SuiAgentKit) {
  return [
    // new SuiCreateImageTool(suiKit),
    new SuiGetWalletAddressTool(suiKit),
    new SuiGetHoldingTool(suiKit),
    new SuiTransferTokenTool(suiKit),
    new SuiDeployTokenTool(suiKit),
    new SuiCreatePoolCetusCLMMTool(suiKit),
    new SuiSwapTool(suiKit),
    new SuiRegisterSnsTool(suiKit),
    new SuiGetSnsNameRecordTool(suiKit),
    new SuiGetVaultsTool(suiKit),

    // native staking
    new SuiStakeTool(suiKit),
    new SuiGetStakeTool(suiKit),
    new SuiUnstakeTool(suiKit),

    // suilend
    new SuiStakeSuilendTool(suiKit),
    new SuiWithDrawSuilendTool(suiKit),
    new SuiLendingSuilendTool(suiKit),
    new SuiUnstakeSuilendTool(suiKit),
    new SuiBorrowSuilendTool(suiKit),
    new SuiRepaySuilendTool(suiKit),

    // alphafi
    new SuiStakeAlphafiTool(suiKit),
    new SuiUnstakeAlphafiTool(suiKit),

    // alphalend
    new SuiLendingAlphalendTool(suiKit),
    new SuiWithDrawAlphalendTool(suiKit),
    new SuiRepayAlphalendTool(suiKit),
    new SuiBorrowAlphalendTool(suiKit),

    // scallop
    new SuiLendingScallopTool(suiKit),
    new SuiWithDrawScallopTool(suiKit),

    // navi
    new SuiStakeNaviTool(suiKit),
    new SuiUnstakeNaviTool(suiKit),
    new SuiBorrowNaviTool(suiKit),
    new SuiRepayNaviTool(suiKit),
  ];
}
