// import createImageAction from "./agent/createImage";
import deployToken from "./agent/deployToken";
import getWalletHolding from "./agent/getWalletHolding";
import transferToken from "./agent/transferToken";
import getWalletAddress from "./agent/getWalletAddress";
import createPoolCetusCLMM from "./agent/createPoolCetusCLMM";
import swapToken from "./agent/swap";
import registerSns from "./agent/registerSns";
import getSnsNameRecord from "./agent/getSnsNameRecord";
import getVaults from "./agent/getVaults";

// native staking
import stake from "./agent/stake";
import unstake from "./agent/unstake";
import getStake from "./agent/getStake";

// suilend
import stakeSuilend from "./agent/protocols/suilend/stakeSuilend";
import unstakeSuilend from "./agent/protocols/suilend/unstakeSuilend";
import withdrawSuilend from "./agent/protocols/suilend/withdrawSuilend";
import lendingSuilend from "./agent/protocols/suilend/lendingSuilend";

// scallop
import lendingScallop from "./agent/protocols/scallop/lendingScallop";
import withdrawScallop from "./agent/protocols/scallop/withdrawScallop";

// navi
import stakeNavi from "./agent/protocols/navi/stakeNavi";
import unstakeNavi from "./agent/protocols/navi/unstakeNavi";
import repayNavi from "./agent/protocols/navi/repayNavi";
import borrowNavi from "./agent/protocols/navi/borrowNavi";

// alphalend
import lendingAlphalend from "./agent/protocols/alphalend/lendingAlphalend";
import withdrawAlphalend from "./agent/protocols/alphalend/withdrawAlphalend";
import repayAlphalend from "./agent/protocols/alphalend/repayAlphalend";
import borrowAlphalend from "./agent/protocols/alphalend/borrowAlphalend";

export const ACTIONS = {
  // CREATE_IMAGE_ACTION: createImageAction,
  GET_WALLET_HOLDING: getWalletHolding,
  TRANSFER_TOKEN: transferToken,
  DEPLOY_TOKEN: deployToken,
  GET_WALLET_ADDRESS: getWalletAddress,
  CREATE_POOL_CETUS_CLMM: createPoolCetusCLMM,
  SWAP_TOKEN: swapToken,
  REGISTER_SNS: registerSns,
  GET_SNS_NAME_RECORD: getSnsNameRecord,
  GET_VAULTS: getVaults,

  // native staking
  STAKE: stake,
  UNSTAKE: unstake,
  GET_STAKE: getStake,

  // suilend
  STAKE_SUILEND: stakeSuilend,
  UNSTAKE_SUILEND: unstakeSuilend,
  WITHDRAW_SUILEND: withdrawSuilend,
  LENDING_SUILEND: lendingSuilend,

  // scallop
  LENDING_SCALLOP: lendingScallop,
  WITHDRAW_SCALLOP: withdrawScallop,

  // navi
  STAKE_NAVI: stakeNavi,
  UNSTAKE_NAVI: unstakeNavi,
  REPAY_NAVI: repayNavi,
  BORROW_NAVI: borrowNavi,

  // alphalend
  LENDING_ALPHALEND: lendingAlphalend,
  WITHDRAW_ALPHALEND: withdrawAlphalend,
  REPAY_ALPHALEND: repayAlphalend,
  BORROW_ALPHALEND: borrowAlphalend,
};

export type { Action, ActionExample, Handler } from "../types/action";
