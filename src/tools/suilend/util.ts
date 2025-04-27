import { SuiAgentKit } from "../../agent";
import {
  NORMALIZED_SEND_POINTS_S2_COINTYPE,
  NORMALIZED_SUI_COINTYPE,
  getCoinMetadataMap,
  getToken,
  isSendPointsS2,
  Token,
} from "@suilend/frontend-sui";
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  ParsedObligation,
  RewardMap,
  Side,
  SuilendClient,
  formatRewards,
  getDedupedPerDayRewards,
  getFilteredRewards,
  getTotalAprPercent,
  initializeObligations,
  initializeSuilend,
  initializeSuilendRewards,
} from "@suilend/sdk";
import {
  ADMIN_ADDRESS,
  ParsedReserve,
  ParsedLendingMarket,
} from "@suilend/sdk";
import {
  LiquidStakingObjectInfo,
  LstClient,
  fetchLiquidStakingInfo,
  fetchRegistryLiquidStakingInfoMap,
} from "@suilend/springsui-sdk";
import BigNumber from "bignumber.js";
import { SUI_DECIMALS } from "@mysten/sui/utils";
import { LENDING_MARKETS } from "@suilend/sdk/client";
import { CoinMetadata } from "@mysten/sui/client";
import { ObligationOwnerCap } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import { Reserve } from "@suilend/sdk/_generated/suilend/reserve/structs";
import pLimit from "p-limit";

interface LstData {
  LIQUID_STAKING_INFO: LiquidStakingObjectInfo;
  lstClient: LstClient;

  totalSuiSupply: BigNumber;
  totalLstSupply: BigNumber;
  suiToLstExchangeRate: BigNumber;
  lstToSuiExchangeRate: BigNumber;

  mintFeePercent: BigNumber;
  redeemFeePercent: BigNumber;
  spreadFeePercent: BigNumber;
  aprPercent?: BigNumber;

  fees: BigNumber;
  accruedSpreadFees: BigNumber;

  token: Token;
  price: BigNumber;

  suilendReserveStats:
    | {
        aprPercent: BigNumber;
        tvlUsd: BigNumber;
        sendPointsPerDay: BigNumber;
      }
    | undefined;
}

interface AppData {
  suilendClient: SuilendClient;

  lendingMarket: ParsedLendingMarket;
  coinMetadataMap: Record<string, CoinMetadata>;

  refreshedRawReserves: Reserve<string>[];
  reserveMap: Record<string, ParsedReserve>;
  reserveCoinTypes: string[];
  reserveCoinMetadataMap: Record<string, CoinMetadata>;

  rewardPriceMap: Record<string, BigNumber | undefined>;
  rewardCoinTypes: string[];
  activeRewardCoinTypes: string[];
  rewardCoinMetadataMap: Record<string, CoinMetadata>;
}

interface UserData {
  obligationOwnerCaps: ObligationOwnerCap<string>[];
  obligations: ParsedObligation[];
  rewardMap: RewardMap;
}

export async function useFetchUserData(allAppData: any, agent: SuiAgentKit) {
  const dataFetcher = async () => {
    if (!allAppData) {
      return undefined as unknown as Record<string, UserData>;
    }

    const result: Record<string, UserData> = {};

    for (const appData of Object.values(allAppData)) {
      const { obligationOwnerCaps, obligations } = await initializeObligations(
        agent.client as any,
        (appData as any).suilendClient,
        (appData as any).refreshedRawReserves,
        (appData as any).reserveMap,
        agent.wallet_address,
      );

      const rewardMap = formatRewards(
        (appData as any).reserveMap,
        (appData as any).rewardCoinMetadataMap,
        (appData as any).rewardPriceMap,
        obligations,
      );

      result[(appData as any).lendingMarket.id] = {
        obligationOwnerCaps,
        obligations,
        rewardMap,
      };
    }

    return result;
  };

  const data = await dataFetcher();

  return data;
}

export async function useFetchAppData(agent: SuiAgentKit) {
  const isAdmin = agent.wallet_address === ADMIN_ADDRESS;

  const dataFetcher = async () => {
    const result: Record<string, AppData> = {};

    for (const LENDING_MARKET of LENDING_MARKETS) {
      if (LENDING_MARKET.isHidden && !isAdmin) {
        continue;
      }

      const suilendClient = await SuilendClient.initialize(
        LENDING_MARKET.id,
        LENDING_MARKET.type,
        agent.client as any,
        true,
      );

      const {
        lendingMarket,
        coinMetadataMap,

        refreshedRawReserves,
        reserveMap,
        reserveCoinTypes,
        reserveCoinMetadataMap,

        rewardCoinTypes,
        activeRewardCoinTypes,
        rewardCoinMetadataMap,
      } = await initializeSuilend(agent.client as any, suilendClient);

      const { rewardPriceMap } = await initializeSuilendRewards(
        reserveMap,
        activeRewardCoinTypes,
      );

      result[lendingMarket.id] = {
        suilendClient,

        lendingMarket,
        coinMetadataMap,

        refreshedRawReserves,
        reserveMap,
        reserveCoinTypes,
        reserveCoinMetadataMap,

        rewardPriceMap,
        rewardCoinTypes,
        activeRewardCoinTypes,
        rewardCoinMetadataMap,
      };
    }

    return result;
  };

  const data = await dataFetcher();

  return data;
}

export async function useFetchAppDataSpringSui(agent: SuiAgentKit) {
  const dataFetcher = async () => {
    const limit10 = pLimit(10);

    const suilendClient = await SuilendClient.initialize(
      LENDING_MARKET_ID,
      LENDING_MARKET_TYPE,
      agent.client as any,
    );

    const {
      refreshedRawReserves,
      reserveMap,

      activeRewardCoinTypes,
      rewardCoinMetadataMap,
    } = await initializeSuilend(agent.client as any, suilendClient);

    const { rewardPriceMap } = await initializeSuilendRewards(
      reserveMap,
      activeRewardCoinTypes,
    );

    const { obligationOwnerCaps, obligations } = await initializeObligations(
      agent.client as any,
      suilendClient,
      refreshedRawReserves,
      reserveMap,
      agent.wallet_address,
    );

    const rewardMap = formatRewards(
      reserveMap,
      rewardCoinMetadataMap,
      rewardPriceMap,
      obligations,
    );

    // LSTs
    const LIQUID_STAKING_INFO_MAP = await fetchRegistryLiquidStakingInfoMap(
      agent.client as any,
    );

    const lstCoinTypes = Object.keys(LIQUID_STAKING_INFO_MAP);

    // CoinMetadata
    const coinTypes: string[] = [
      NORMALIZED_SUI_COINTYPE,
      ...lstCoinTypes,
      NORMALIZED_SEND_POINTS_S2_COINTYPE,
    ];
    const uniqueCoinTypes = Array.from(new Set(coinTypes));

    const coinMetadataMap = await getCoinMetadataMap(
      agent.client as any,
      uniqueCoinTypes,
    );

    // SEND Points
    const sendPointsToken = getToken(
      NORMALIZED_SEND_POINTS_S2_COINTYPE,
      coinMetadataMap[NORMALIZED_SEND_POINTS_S2_COINTYPE],
    );

    // SUI
    const suiToken = getToken(
      NORMALIZED_SUI_COINTYPE,
      coinMetadataMap[NORMALIZED_SUI_COINTYPE],
    );
    const suiPrice = reserveMap[NORMALIZED_SUI_COINTYPE].price;

    // Epoch
    const latestSuiSystemState = await agent.client.getLatestSuiSystemState();

    const currentEpoch = +latestSuiSystemState.epoch;
    const currentEpochProgressPercent =
      ((Date.now() - +latestSuiSystemState.epochStartTimestampMs) /
        +latestSuiSystemState.epochDurationMs) *
      100;
    const currentEpochEndMs =
      +latestSuiSystemState.epochStartTimestampMs +
      +latestSuiSystemState.epochDurationMs;

    // LSTs
    const lstData: [string, LstData][] = await Promise.all(
      Object.entries(LIQUID_STAKING_INFO_MAP).map(
        ([coinType, LIQUID_STAKING_INFO]) =>
          limit10<[], [string, LstData]>(async () => {
            // Client
            const lstClient = await LstClient.initialize(
              agent.client as any,
              LIQUID_STAKING_INFO,
            );

            // Staking info
            const rawLiquidStakingInfo = await fetchLiquidStakingInfo(
              LIQUID_STAKING_INFO,
              agent.client as any,
            );

            const totalSuiSupply = new BigNumber(
              rawLiquidStakingInfo.storage.totalSuiSupply.toString(),
            ).div(10 ** SUI_DECIMALS);
            const totalLstSupply = new BigNumber(
              rawLiquidStakingInfo.lstTreasuryCap.totalSupply.value.toString(),
            ).div(10 ** coinMetadataMap[LIQUID_STAKING_INFO.type].decimals);

            const suiToLstExchangeRate = !totalSuiSupply.eq(0)
              ? totalLstSupply.div(totalSuiSupply)
              : new BigNumber(1);
            const lstToSuiExchangeRate = !totalLstSupply.eq(0)
              ? totalSuiSupply.div(totalLstSupply)
              : new BigNumber(1);

            const mintFeePercent = new BigNumber(
              rawLiquidStakingInfo.feeConfig.element?.suiMintFeeBps.toString() ??
                0,
            ).div(100);
            // stakedSuiMintFeeBps
            const redeemFeePercent = new BigNumber(
              rawLiquidStakingInfo.feeConfig.element?.redeemFeeBps.toString() ??
                0,
            ).div(100);
            // stakedSuiRedeemFeeBps
            const spreadFeePercent = new BigNumber(
              rawLiquidStakingInfo.feeConfig.element?.spreadFeeBps.toString() ??
                0,
            ).div(100);
            // customRedeemFeeBps

            const apr = await lstClient.getSpringSuiApy(); // TODO: Use APR
            const aprPercent = new BigNumber(apr).times(100);

            const fees = new BigNumber(
              rawLiquidStakingInfo.fees.value.toString(),
            ).div(10 ** SUI_DECIMALS);
            const accruedSpreadFees = new BigNumber(
              rawLiquidStakingInfo.accruedSpreadFees.toString(),
            ).div(10 ** coinMetadataMap[LIQUID_STAKING_INFO.type].decimals);

            const lstToken = getToken(
              LIQUID_STAKING_INFO.type,
              coinMetadataMap[LIQUID_STAKING_INFO.type],
            );
            const lstPrice = !suiToLstExchangeRate.eq(0)
              ? suiPrice.div(suiToLstExchangeRate)
              : suiPrice;

            const suilendLstReserve = reserveMap[LIQUID_STAKING_INFO.type];
            const suilendLstRewards = rewardMap[LIQUID_STAKING_INFO.type];

            const suilendReserveStats =
              suilendLstReserve && suilendLstRewards
                ? {
                    aprPercent: getTotalAprPercent(
                      Side.DEPOSIT,
                      suilendLstReserve.depositAprPercent,
                      getFilteredRewards(suilendLstRewards.deposit),
                    ),
                    tvlUsd: suilendLstReserve.availableAmountUsd,
                    sendPointsPerDay:
                      getDedupedPerDayRewards(
                        getFilteredRewards(suilendLstRewards.deposit),
                      ).find((r) => isSendPointsS2(r.stats.rewardCoinType))
                        ?.stats.perDay ?? new BigNumber(0),
                  }
                : undefined;

            return [
              coinType,
              {
                LIQUID_STAKING_INFO,
                lstClient,

                totalSuiSupply,
                totalLstSupply,
                suiToLstExchangeRate,
                lstToSuiExchangeRate,

                mintFeePercent,
                redeemFeePercent,
                spreadFeePercent,
                aprPercent,

                fees,
                accruedSpreadFees,

                token: lstToken,
                price: lstPrice,

                suilendReserveStats,
              },
            ];
          }),
      ),
    );
    const lstDataMap = Object.fromEntries(lstData);

    return {
      suilendClient,
      obligationOwnerCaps,
      obligations,

      sendPointsToken,
      suiToken,
      suiPrice,

      LIQUID_STAKING_INFO_MAP,
      lstCoinTypes,
      lstDataMap,

      currentEpoch,
      currentEpochProgressPercent,
      currentEpochEndMs,
    };
  };

  const data = await dataFetcher();

  return data;
}
