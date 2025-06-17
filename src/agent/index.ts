import { DelegatedStake, getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { create_pool_cetus_CLMM, get_holding, swap } from "../tools";
import {
  Config,
  ICreatePoolCLMMParams,
  IGetVaultsParams,
  ISwapParams,
  TokenBalance,
  TransactionResponse,
  TransferTokenResponse,
} from "../types";

import { NameRecord } from "@mysten/suins/dist/cjs/types";
import { ICreateTokenForm } from "../utils/move-template/coin";
import { transfer_token } from "../tools/sui/token/transfer_token";
import { deploy_token } from "../tools/sui/token/deploy_token";
import { register_sns } from "../tools/sns/register";
import { get_name_record } from "../tools/sns/ get_name";
import { getVaults } from "../tools/sui/defi/get_vaults";
import {
  ILendingParams,
  IStakingParams,
  IUnstakingParams,
  IBorrowParams,
  IRepayParams,
  IWithdrawParams,
} from "../types/farming";

import { stake } from "../tools/sui/defi/stake/stake";
import { get_stake } from "../tools/sui/defi/stake/get_stake";
import { unstake } from "../tools/sui/defi/stake/unstake";

import {
  lending_suilend,
  staking_suilend,
  unstake_suilend,
  withdraw_suilend,
  borrow_suilend,
  repay_suilend,
} from "../tools/suilend";

import { stake_alphafi, unstake_alphafi } from "../tools/alphafi";

import {
  lending_alphalend,
  withdraw_alphalend,
  borrow_alphalend,
  repay_alphalend,
} from "../tools/alphalend";

import { lending_scallop, withdraw_scallop } from "../tools/scallop";

import {
  staking_navi,
  unstake_navi,
  borrow_navi,
  repay_navi,
} from "../tools/navi";

/**
 * Main class for interacting with Sui blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class SuiAgentKit
 * @property {SuiClient} client - Sui RPC connection
 * @property {Ed25519Keypair} wallet - Wallet keypair for signing transactions
 * @property {string} wallet_address - Public key of the wallet
 * @property {Config} config - Configuration object
 */
export class SuiAgentKit {
  public client: SuiClient;
  public wallet: Ed25519Keypair;
  public wallet_address: string;
  public config: Config;

  /**
   * @deprecated Using openai_api_key directly in constructor is deprecated.
   * Please use the new constructor with Config object instead:
   * @example
   * const agent = new SuiAgentKit(privateKey, rpcUrl, {
   *   OPENAI_API_KEY: 'your-key'
   * });
   */
  constructor(
    private_key: string,
    rpc_url: string,
    openai_api_key: string | null,
  );
  constructor(private_key: string, rpc_url: string, config: Config);
  constructor(
    private_key: string,
    rpc_url: string,
    configOrKey: Config | string | null,
  ) {
    this.client = new SuiClient({
      url: getFullnodeUrl("mainnet"),
    });
    this.wallet = Ed25519Keypair.fromSecretKey(private_key);
    this.wallet_address = this.wallet.getPublicKey().toSuiAddress();

    // Handle both old and new patterns
    if (typeof configOrKey === "string" || configOrKey === null) {
      this.config = { OPENAI_API_KEY: configOrKey || "" };
    } else {
      this.config = configOrKey;
    }
  }

  // Tool methods
  // async requestFaucetFunds() {
  //   return request_faucet_funds(this);
  // }

  getWalletAddress(): string {
    return this.wallet_address;
  }

  async getHoldings(): Promise<TokenBalance[]> {
    return get_holding(this);
  }

  async transferToken(
    token_symbol: string,
    to: string,
    amount: number,
  ): Promise<TransactionResponse> {
    return transfer_token(this, token_symbol, to, amount);
  }

  async deployToken(form: ICreateTokenForm): Promise<TransferTokenResponse> {
    return deploy_token(this, form);
  }

  async createPoolCetusCLMM(
    params: ICreatePoolCLMMParams,
  ): Promise<TransactionResponse> {
    return create_pool_cetus_CLMM(this, params);
  }

  async swap(params: ISwapParams): Promise<TransactionResponse> {
    return swap(this, params);
  }

  async registerSns(
    name: string,
    years: number,
    payToken: "SUI" | "USDC" | "NS",
  ): Promise<TransactionResponse> {
    return register_sns(this, name, years, payToken);
  }

  async getSnsNameRecord(name: string): Promise<NameRecord | null> {
    return get_name_record(this, name);
  }

  async getVaults(params: IGetVaultsParams) {
    return getVaults(this, params);
  }

  // Native Staking
  async getStake(): Promise<DelegatedStake[]> {
    return get_stake(this);
  }
  async stake(amount: number, poolId: string): Promise<TransactionResponse> {
    return stake(this, amount, poolId);
  }
  async unstake(stakedSuiId: string): Promise<TransactionResponse> {
    return unstake(this, stakedSuiId);
  }

  // Suilend
  async stakeSuilend(params: IStakingParams): Promise<TransactionResponse> {
    return staking_suilend(this, params);
  }
  async unstakeSuilend(params: IUnstakingParams): Promise<TransactionResponse> {
    return unstake_suilend(this, params);
  }
  async borrowSuilend(params: IBorrowParams): Promise<TransactionResponse> {
    return borrow_suilend(this, params);
  }
  async repaySuilend(params: IRepayParams): Promise<TransactionResponse> {
    return repay_suilend(this, params);
  }
  async lendingSuilend(params: ILendingParams): Promise<TransactionResponse> {
    return lending_suilend(this, params);
  }
  async withdrawSuilend(
    params: IUnstakingParams,
  ): Promise<TransactionResponse> {
    return withdraw_suilend(this, params);
  }

  // Alphafi
  async stakeAlphafi(params: IStakingParams): Promise<TransactionResponse> {
    return stake_alphafi(this, params);
  }
  async unstakeAlphafi(params: IUnstakingParams): Promise<TransactionResponse> {
    return unstake_alphafi(this, params);
  }

  // Alphalend
  async lendingAlphalend(params: ILendingParams): Promise<TransactionResponse> {
    return lending_alphalend(this, params);
  }
  async withdrawAlphalend(
    params: IWithdrawParams,
  ): Promise<TransactionResponse> {
    return withdraw_alphalend(this, params);
  }
  async borrowAlphalend(params: IBorrowParams): Promise<TransactionResponse> {
    return borrow_alphalend(this, params);
  }
  async repayAlphalend(params: IRepayParams): Promise<TransactionResponse> {
    return repay_alphalend(this, params);
  }

  // Scallop
  async lendingScallop(params: ILendingParams): Promise<TransactionResponse> {
    return lending_scallop(this, params);
  }
  async withdrawScallop(params: IWithdrawParams): Promise<TransactionResponse> {
    return withdraw_scallop(this, params);
  }

  // Navi
  async stakeNavi(params: IStakingParams): Promise<TransactionResponse> {
    return staking_navi(this, params);
  }
  async unstakeNavi(params: IUnstakingParams): Promise<TransactionResponse> {
    return unstake_navi(this, params);
  }
  async borrowNavi(params: IBorrowParams): Promise<TransactionResponse> {
    return borrow_navi(this, params);
  }
  async repayNavi(params: IRepayParams): Promise<TransactionResponse> {
    return repay_navi(this, params);
  }
}
