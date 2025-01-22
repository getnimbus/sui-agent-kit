import createImageAction from "./agent/createImage";
import deployToken from "./agent/deployToken";
import getWalletHolding from "./agent/getWalletHolding";
import transferToken from "./agent/transferToken";
import getWalletAddress from "./agent/getWalletAddress";
import stake from "./agent/stake";
import unstake from "./agent/unstake";
import getStake from "./agent/getStake";

export const ACTIONS = {
  CREATE_IMAGE_ACTION: createImageAction,
  GET_WALLET_HOLDING: getWalletHolding,
  TRANSFER_TOKEN: transferToken,
  DEPLOY_TOKEN: deployToken,
  GET_WALLET_ADDRESS: getWalletAddress,
  STAKE: stake,
  UNSTAKE: unstake,
  GET_STAKE: getStake,
};

export type { Action, ActionExample, Handler } from "../types/action";
