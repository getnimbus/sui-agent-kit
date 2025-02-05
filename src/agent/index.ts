import { DelegatedStake, getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { get_holding } from "../tools";
import {
  Config,
  StakedSui,
  TokenBalance,
  TransactionResponse,
  TransferTokenResponse,
} from "../types";
import { transfer_token } from "../tools/sui/token/transfer_token";
import { ICreateTokenForm } from "../utils/move-template/coin";
import { deploy_token } from "../tools/sui/token/deploy_token";
import { stake } from "../tools/sui/defi/stake/stake";
import { get_stake } from "../tools/sui/defi/stake/get_stake";
import { unstake } from "../tools/sui/defi/stake/unstake";
import { register_sns } from "../tools/sns/register";

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

  async stake(amount: number, poolId: string): Promise<TransactionResponse> {
    return stake(this, amount, poolId);
  }

  async getStake(): Promise<DelegatedStake[]> {
    return get_stake(this);
  }

  async unstake(stakedSui: StakedSui): Promise<TransactionResponse> {
    return unstake(this, stakedSui);
  }

  async registerSns(
    name: string,
    years: number,
    payToken: string,
  ): Promise<TransactionResponse> {
    return register_sns(this, name, years, payToken);
  }
}
