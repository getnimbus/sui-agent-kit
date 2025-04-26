import { SuiAgentKit } from "../agent";
import { z } from "zod";
import { NameRecord } from "@mysten/suins/dist/cjs/types";

export interface Config {
  BASE_URL?: string;
  OPENAI_API_KEY?: string;
  JUPITER_REFERRAL_ACCOUNT?: string;
  JUPITER_FEE_BPS?: number;
  FLASH_PRIVILEGE?: string;
}

export interface Creator {
  address: string;
  percentage: number;
}

export interface CollectionOptions {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
  creators?: Creator[];
}

// Add return type interface
export interface PumpFunTokenOptions {
  twitter?: string;
  telegram?: string;
  website?: string;
  initialLiquiditySOL?: number;
  slippageBps?: number;
  priorityFee?: number;
}

export interface PumpfunLaunchResponse {
  signature: string;
  mint: string;
  metadataUri?: string;
  error?: string;
}

/**
 * Lulo Account Details response format
 */
export interface LuloAccountDetailsResponse {
  totalValue: number;
  interestEarned: number;
  realtimeApy: number;
  settings: {
    owner: string;
    allowedProtocols: string | null;
    homebase: string | null;
    minimumRate: string;
  };
}

export interface JupiterTokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  tags: string[];
  logoURI: string;
  daily_volume: number;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  extensions: {
    coingeckoId?: string;
  };
}

export interface FetchPriceResponse {
  status: "success" | "error";
  tokenId?: string;
  priceInUSDC?: string;
  message?: string;
  code?: string;
}

export interface PythFetchPriceResponse {
  status: "success" | "error";
  tokenSymbol: string;
  priceFeedID?: string;
  price?: string;
  message?: string;
  code?: string;
}

export interface GibworkCreateTaskReponse {
  status: "success" | "error";
  taskId?: string | undefined;
  signature?: string | undefined;
}

/**
 * Example of an action with input and output
 */
export interface ActionExample {
  input: Record<string, any>;
  output: Record<string, any>;
  explanation: string;
}

/**
 * Handler function type for executing the action
 */
export type Handler = (
  agent: SuiAgentKit,
  input: Record<string, any>,
) => Promise<Record<string, any>>;

/**
 * Main Action interface inspired by ELIZA
 * This interface makes it easier to implement actions across different frameworks
 */
export interface Action {
  /**
   * Unique name of the action
   */
  name: string;

  /**
   * Alternative names/phrases that can trigger this action
   */
  similes: string[];

  /**
   * Detailed description of what the action does
   */
  description: string;

  /**
   * Array of example inputs and outputs for the action
   * Each inner array represents a group of related examples
   */
  examples: ActionExample[][];

  /**
   * Zod schema for input validation
   */
  schema: z.ZodType<any>;

  /**
   * Function that executes the action
   */
  handler: Handler;
}

export interface TokenCheck {
  tokenProgram: string;
  tokenType: string;
  risks: Array<{
    name: string;
    level: string;
    description: string;
    score: number;
  }>;
  score: number;
}

export interface PythPriceFeedIDItem {
  id: string;
  attributes: {
    asset_type: string;
    base: string;
  };
}

export interface PythPriceItem {
  binary: {
    data: string[];
    encoding: string;
  };
  parsed: [
    Array<{
      id: string;
      price: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
      };
      ema_price: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
      };
      metadata: {
        slot: number;
        proof_available_time: number;
        prev_publish_time: number;
      };
    }>,
  ];
}

export interface OrderParams {
  quantity: number;
  side: string;
  price: number;
}

export interface BatchOrderPattern {
  side: string;
  totalQuantity?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  spacing?: {
    type: "percentage" | "fixed";
    value: number;
  };
  numberOfOrders?: number;
  individualQuantity?: number;
}

export interface FlashTradeParams {
  token: string;
  side: "long" | "short";
  collateralUsd: number;
  leverage: number;
}

export interface FlashCloseTradeParams {
  token: string;
  side: "long" | "short";
}

export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

export interface TransferTokenResponse {
  tx_hash: string;
  tx_status: string;
}

export interface TransactionResponse {
  tx_hash: string;
  tx_status: string;
}

export interface ICreatePoolCLMMParams {
  coinTypeA: string;
  coinTypeB: string;
  initializePrice: number;
  tickSpacing: 2 | 10 | 20 | 60 | 200 | 220;
  inputTokenAmount: number;
  isTokenAInput: boolean;
  slippage: number | undefined; // 0.05 means 5%
}

export interface ISwapParams {
  fromToken: string;
  toToken: string;
  inputAmount: number;
  slippage: number | undefined;
  aggregator: string;
}

export interface NameRecordX extends NameRecord {
  humanReadableExpirationTimestampMs: string;
}

export enum VaultTags {
  STABLE_YIELD = "stable_yield",
  LOW_RISK = "low_risk",
  HIGH_RISK_HIGH_RETURN = "high_risk_high_return",
  AIRDROP = "airdrop",
}

export enum VaultTVL {
  EMPTY = "",
  LESS_THAN_100K = "< 100K",
  BETWEEN_100K_500K = "100K - 500K",
  BETWEEN_500K_1M = "500K - 1M",
  MORE_THAN_1M = "> 1M",
}

export enum VaultAPR {
  EMPTY = "",
  LESS_THAN_5 = "< 5%",
  BETWEEN_5_25 = "5% - 25%",
  BETWEEN_25_50 = "25% - 50%",
  MORE_THAN_50 = "> 50%",
}

export enum VaultType {
  EMPTY = "",
  LP = "LP",
  VAULT = "VAULT",
  STAKING = "STAKING",
  LENDING = "LENDING",
}

export interface IGetVaultsParams {
  address: string;
  order: string;
  protocol: string;
  tvl: VaultTVL;
  apr: VaultAPR;
  tags: VaultTags[];
}
