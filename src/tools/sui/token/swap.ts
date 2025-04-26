import { setSuiClient, getQuote, buildTx } from "@7kprotocol/sdk-ts";
import { ISwapParams, SuiAgentKit, TransactionResponse } from "../../../index";
import logger from "../../../utils/logger";
import { AggregatorQuoter, TradeBuilder } from "@flowx-finance/sdk";

/**
 * Transfer token to another address
 * @param agent - SuiAgentKit instance
 * @returns Promise resolving to the transaction hash
 */

export const COIN_MAPPING = new Map<string, string>([
  [
    "SUI",
    "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  ],
  [
    "wUSDC",
    "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  ],
  [
    "USDC",
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  ],
  [
    "wUSDT",
    "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  ],
  [
    "DEEP",
    "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  ],
  [
    "sbUSDT",
    "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT",
  ],
  [
    "HIPPO",
    "0x8993129d72e733985f7f1a00396cbd055bad6f817fee36576ce483c8bbb8b87b::sudeng::SUDENG",
  ],
  [
    "BUCK",
    "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
  ],
  [
    "CETUS",
    "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
  ],
  [
    "sbETH",
    "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH",
  ],
  [
    "haSUI",
    "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
  ],
  [
    "FDUSD",
    "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD",
  ],
  [
    "SOL",
    "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN",
  ],
  [
    "LOFI",
    "0xf22da9a24ad027cccb5f2d496cbe91de953d363513db08a3a734d361c7c17503::LOFI::LOFI",
  ],
  [
    "NS",
    "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
  ],
  [
    "SEND",
    "0xb45fcfcc2cc07ce0702cc2d229621e046c906ef14d9b25e8e4d25f6e8763fef7::send::SEND",
  ],
  [
    "WBTC",
    "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN",
  ],
  [
    "AUSD",
    "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD",
  ],
  [
    "AFSUI",
    "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
  ],
  [
    "MIU",
    "0x32a976482bf4154961bf20bfa3567a80122fdf8e8f8b28d752b609d8640f7846::miu::MIU",
  ],
]);

export async function swap(
  agent: SuiAgentKit,
  params: ISwapParams,
): Promise<TransactionResponse> {
  try {
    const client = agent.client;
    const quoter = new AggregatorQuoter("mainnet");

    params.fromToken = COIN_MAPPING.get(params.fromToken) || params.fromToken;
    params.toToken = COIN_MAPPING.get(params.toToken) || params.toToken;
    if (!params.aggregator) {
      params.aggregator = "7k";
    }

    // check balance
    const [balance, metadata] = await Promise.all([
      client.getBalance({
        owner: agent.wallet_address,
        coinType: params.fromToken,
      }),
      client.getCoinMetadata({
        coinType: params.fromToken,
      }),
    ]);

    if (!metadata) {
      throw new Error(`Token ${params.fromToken} not found in wallet`);
    }

    const adjustInputAmount =
      params.inputAmount * 10 ** (metadata?.decimals || 9);

    if (Number(balance.totalBalance) < adjustInputAmount) {
      throw new Error("Insufficient balance");
    }

    setSuiClient(agent.client);

    let quoteResponse: any;
    let txBuild: any;

    switch (params.aggregator) {
      case "7k": {
        quoteResponse = await getQuote({
          tokenIn: params.fromToken,
          tokenOut: params.toToken,
          amountIn: BigInt(adjustInputAmount).toString(),
        });

        txBuild = await buildTx({
          quoteResponse,
          accountAddress: agent.wallet_address,
          slippage: Number(params.slippage || 0.01), // settings slippage or default 1%
          commission: {
            partner:
              "0xfcd7df57ede898715bc7c5aba3dd31e23b715d2dd16668383ce123666a5e24c3",
            commissionBps: 0,
          },
        }).then((res) => {
          return res.tx;
        });

        break;
      }
      case "flowx": {
        quoteResponse = await quoter.getRoutes({
          tokenIn: params.fromToken,
          tokenOut: params.toToken,
          amountIn: adjustInputAmount.toString(),
        });

        const tradeBuilder = new TradeBuilder("mainnet", quoteResponse.routes); //routes get from quoter
        txBuild = await tradeBuilder
          .sender(agent.wallet_address || "") //Optional if you want pass coin later
          .slippage((1 / 100) * 1e6) // Slippage 1%
          .build()
          .buildTransaction({ client });

        break;
      }
      default:
        throw new Error("Invalid aggregator");
    }

    const txExec = await client.signAndExecuteTransaction({
      signer: agent.wallet,
      transaction: txBuild,
    });

    const tx = await client.waitForTransaction({
      digest: txExec.digest,
      options: {
        showEffects: true,
      },
    });

    return {
      tx_hash: txExec.digest,
      tx_status: tx.effects?.status.status || "unknown",
    };
  } catch (error: any) {
    logger.error(error);
    throw new Error(`Failed to transfer token: ${error.message}`);
  }
}
