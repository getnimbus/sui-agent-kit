// import createImageAction from "./agent/createImage";
import deployToken from "./agent/deployToken";
import getWalletHolding from "./agent/getWalletHolding";
import transferToken from "./agent/transferToken";
import getWalletAddress from "./agent/getWalletAddress";
import stake from "./agent/stake";
import unstake from "./agent/unstake";
import getStake from "./agent/getStake";
import createPoolCetusCLMM from "./agent/createPoolCetusCLMM";
import swapToken from "./agent/swap";
import registerSns from "./agent/registerSns";
import getSnsNameRecord from "./agent/getSnsNameRecord";
import stakeSuilend from "./agent/stakeSuilend";
import unstakeSuilend from "./agent/withdrawSuilend";
import lendingSuilend from "./agent/lendingSuilend";
import getVaults from "./agent/getVaults";

export const ACTIONS = {
  // CREATE_IMAGE_ACTION: createImageAction,
  GET_WALLET_HOLDING: getWalletHolding,
  TRANSFER_TOKEN: transferToken,
  DEPLOY_TOKEN: deployToken,
  GET_WALLET_ADDRESS: getWalletAddress,
  STAKE: stake,
  UNSTAKE: unstake,
  GET_STAKE: getStake,
  CREATE_POOL_CETUS_CLMM: createPoolCetusCLMM,
  SWAP_TOKEN: swapToken,
  REGISTER_SNS: registerSns,
  GET_SNS_NAME_RECORD: getSnsNameRecord,
  STAKE_SUILEND: stakeSuilend,
  UNSTAKE_SUILEND: unstakeSuilend,
  LENDING_SUILEND: lendingSuilend,
  GET_VAULTS: getVaults,
};

export type { Action, ActionExample, Handler } from "../types/action";
