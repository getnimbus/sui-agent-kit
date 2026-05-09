import type { SuiClient } from '@mysten/sui/client'

export const CLOCK_ID = '0x0000000000000000000000000000000000000000000000000000000000000006'

export const EPOCH_CONFIGS = {
  mainnet: {
    PACKAGE_ID:  '0x848cb7edf8b5f7650b3188dec459394472c8ccf206a031497bf55fe40c165da2',
    TREASURY_ID: '0x31bd863db14dd552a28f85641888b7ddc3a4866c4ffde286b30eaf7ac2841553',
    DEPLOY_FEE:  10_000_000_000n,
  },
  testnet: {
    PACKAGE_ID:  '0xc1427dd16f3d6ee090d48b24fc2cdb3effb4d28898504e742987f4eddb61118c',
    TREASURY_ID: '0xaa32f12e76f17d2a78e99c0f7531a55d55aab9750670f2d25b1e8704ce06920a',
    DEPLOY_FEE:  100_000n,
  },
} as const

export type EpochNetwork = keyof typeof EPOCH_CONFIGS

export function getNetwork(client: SuiClient): EpochNetwork {
  const url = (client as any).transport?.url ?? ''
  return url.includes('mainnet') ? 'mainnet' : 'testnet'
}

export function dateToMs(s: string): bigint {
  const ms = new Date(s).getTime()
  if (isNaN(ms)) throw new Error(`Invalid date: "${s}". Use ISO format, e.g. "2027-01-01".`)
  return BigInt(ms)
}

export function toBaseUnits(amount: string, decimals: number): bigint {
  const [intPart, fracPart = ''] = amount.trim().split('.')
  const frac = fracPart.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(intPart || '0') * BigInt(10 ** decimals) + BigInt(frac || '0')
}

export async function getDecimals(client: SuiClient, coinType: string): Promise<number> {
  if (/::sui::SUI$/i.test(coinType)) return 9
  try {
    const meta = await client.getCoinMetadata({ coinType })
    return meta?.decimals ?? 9
  } catch {
    return 9
  }
}

/** Read the current deploy_fee live from the Treasury object — avoids stale hardcoded values */
export async function getDeployFee(client: SuiClient, network: EpochNetwork): Promise<bigint> {
  try {
    const cfg = EPOCH_CONFIGS[network]
    const obj = await client.getObject({ id: cfg.TREASURY_ID, options: { showContent: true } })
    const fields = (obj.data?.content as any)?.fields
    if (fields?.deploy_fee) return BigInt(fields.deploy_fee)
  } catch {}
  // fallback to hardcoded if RPC fails
  return EPOCH_CONFIGS[network === 'mainnet' ? 'mainnet' : 'testnet'].DEPLOY_FEE
}
