export const listSUITokenSupportStakeSDKSuilend = [
  // native
  "SUI",
  "USDT",
  "USDC",
  "SOL",
  "suiETH",
  "AUSD",
  // other
  "FUD",
  "NS",
  "DEEP",
  "HIPPO",
  "BUCK",
];

export const listSpringSuiStaking = [
  {
    symbol: "sSUI",
    address:
      "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI",
  },
  {
    symbol: "mSUI",
    address:
      "0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f::msui::MSUI",
  },
  {
    symbol: "fudSUI",
    address:
      "0x02358129a7d66f943786a10b518fdc79145f1fc8d23420d9948c4aeea190f603::fud_sui::FUD_SUI",
  },
  {
    symbol: "kSUI",
    address:
      "0x41ff228bfd566f0c707173ee6413962a77e3929588d010250e4e76f0d1cc0ad4::ksui::KSUI",
  },
  {
    symbol: "trevinSUI",
    address:
      "0x502867b177303bf1bf226245fcdd3403c177e78d175a55a56c0602c7ff51c7fa::trevin_sui::TREVIN_SUI",
  },
  {
    symbol: "upSUI",
    address:
      "0xe68fad47384e18cd79040cb8d72b7f64d267eebb73a0b8d54711aa860570f404::upsui::UPSUI",
  },
];

import {
  initializeSuilendSdk,
  initializeSuilendRewards,
  LIQUID_STAKING_INFO_MAP,
  LstId,
  NORMALIZED_LST_COINTYPES,
  NORMALIZED_SEND_POINTS_COINTYPE,
  NORMALIZED_SUI_COINTYPE,
  getCoinMetadataMap,
  getToken,
  getTotalAprPercent,
  getFilteredRewards,
  getDedupedPerDayRewards,
  isSendPoints,
} from "@suilend/frontend-sui";
import { LENDING_MARKET_ID, LENDING_MARKET_TYPE, Side } from "@suilend/sdk";
import { LstClient, fetchLiquidStakingInfo } from "@suilend/springsui-sdk";
import BigNumber from "bignumber.js";
import { SUI_DECIMALS } from "@mysten/sui/utils";
import { SuiAgentKit } from "../../agent";
import logger from "../../utils/logger";

export const getSuilendSdkData = async (agent: SuiAgentKit) => {
  try {
    const {
      reserveMap,
      rewardCoinTypes,
      rewardCoinMetadataMap,
      suilendClient,
      obligationOwnerCaps,
      obligations,
      lendingMarket,
    } = await initializeSuilendSdk(
      LENDING_MARKET_ID,
      LENDING_MARKET_TYPE,
      agent.client as any,
      agent.wallet_address,
    );

    const { rewardMap } = await initializeSuilendRewards(
      reserveMap as any,
      rewardCoinTypes,
      rewardCoinMetadataMap,
    );

    // CoinMetadata
    const coinTypes: string[] = [
      NORMALIZED_SUI_COINTYPE,
      ...NORMALIZED_LST_COINTYPES,
      NORMALIZED_SEND_POINTS_COINTYPE,
    ];

    const uniqueCoinTypes = Array.from(new Set(coinTypes));

    const coinMetadataMap = await getCoinMetadataMap(
      agent.client as any,
      uniqueCoinTypes,
    );

    const suiPrice = reserveMap[NORMALIZED_SUI_COINTYPE].price;

    const lstClientMap = Object.values(LstId).reduce(
      (acc, lstId) => ({ ...acc, [lstId]: {} }),
      {} as Record<LstId, LstClient>,
    );

    const lstDataMap = Object.values(LstId).reduce(
      (acc, lstId) => ({ ...acc, [lstId]: {} }),
      {} as Record<LstId, any>,
    );

    for (const _lstId of Object.values(LstId)) {
      const LIQUID_STAKING_INFO = LIQUID_STAKING_INFO_MAP[_lstId];

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
        rawLiquidStakingInfo.lstTreasuryCap.totalSupply?.value.toString(),
      ).div(10 ** coinMetadataMap[LIQUID_STAKING_INFO.type].decimals);

      const suiToLstExchangeRate = !totalSuiSupply.eq(0)
        ? totalLstSupply.div(totalSuiSupply)
        : new BigNumber(0);

      const lstToSuiExchangeRate = !totalLstSupply.eq(0)
        ? totalSuiSupply.div(totalLstSupply)
        : new BigNumber(0);

      const mintFeePercent = new BigNumber(
        rawLiquidStakingInfo.feeConfig.element?.suiMintFeeBps.toString() ?? 0,
      ).div(100);

      // stakedSuiMintFeeBps
      const redeemFeePercent = new BigNumber(
        rawLiquidStakingInfo.feeConfig.element?.redeemFeeBps.toString() ?? 0,
      ).div(100);

      // stakedSuiRedeemFeeBps
      const spreadFeePercent = new BigNumber(
        rawLiquidStakingInfo.feeConfig.element?.spreadFeeBps.toString() ?? 0,
      ).div(100);
      // customRedeemFeeBps

      const apr = await lstClient.getSpringSuiApy();
      const aprPercent = new BigNumber(apr).times(100);

      const fees = new BigNumber(
        rawLiquidStakingInfo.fees?.value.toString(),
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
                ).find((r) => isSendPoints(r.stats.rewardCoinType))?.stats
                  .perDay ?? new BigNumber(0),
            }
          : undefined;

      lstClientMap[_lstId] = lstClient;
      lstDataMap[_lstId] = {
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
      };
    }

    return {
      lstClientMap,
      lstDataMap,
      suilendClient,
      obligationOwnerCaps,
      obligations,
      lendingMarket,
    };
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
