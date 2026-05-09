import type { SuiAgentKit } from '../../agent/index'
import { getNetwork, getDecimals } from './utils'

export interface VaultInfo {
  vaultId:       string
  tokenType:     string
  isMulti:       boolean
  kind:          'cliff' | 'linear' | 'hybrid'
  creator:       string
  totalLocked:   string
  claimed:       string
  claimedPct:    number
  cliffDate:     string | null
  cliffPct:      number
  linearStart:   string | null
  linearEnd:     string | null
  beneficiary:   string | null  // single vault only
  beneficiaries: number | null  // multi vault only
  epochUrl:      string
  suiVisionUrl:  string
}

export async function epoch_get_vault_info(
  agent:   SuiAgentKit,
  vaultId: string,
): Promise<VaultInfo> {
  const network = getNetwork(agent.client)
  const obj = await agent.client.getObject({ id: vaultId, options: { showContent: true, showType: true } })
  if (obj.data?.content?.dataType !== 'moveObject') throw new Error('Object not found or not a Move object')

  const type      = obj.data.content.type
  const f         = obj.data.content.fields as any
  const isMulti   = type.includes('MultiVestingVault')
  const coinMatch = type.match(/<(.+)>$/)
  const tokenType = coinMatch ? coinMatch[1] : 'unknown'
  const decimals  = await getDecimals(agent.client, tokenType)

  const total    = BigInt(f.total_locked ?? '0')
  const cliffBps = Number(f.cliff_bps ?? 0)
  const kind     = cliffBps === 10000 ? 'cliff' : cliffBps === 0 ? 'linear' : 'hybrid'

  let claimedRaw = 0n
  if (!isMulti) {
    claimedRaw = BigInt(f.claimed ?? '0')
  } else {
    const contents: any[] = f.claimed?.fields?.contents ?? f.claimed?.contents ?? []
    claimedRaw = contents.reduce((s: bigint, e: any) => s + BigInt(e.fields?.value ?? e.value ?? '0'), 0n)
  }

  const fmt = (raw: bigint) => (Number(raw) / 10 ** decimals).toFixed(4)
  const fmtDate = (ms: string | number) => {
    const t = Number(ms)
    return (!t || t < 1_577_836_800_000) ? null : new Date(t).toISOString()
  }

  const suiBase = network === 'mainnet' ? 'https://suivision.xyz' : `https://${network}.suivision.xyz`

  return {
    vaultId,
    tokenType,
    isMulti,
    kind:          kind as VaultInfo['kind'],
    creator:       f.creator ?? '',
    totalLocked:   fmt(total),
    claimed:       fmt(claimedRaw),
    claimedPct:    total > 0n ? Math.round(Number(claimedRaw * 10000n / total)) / 100 : 0,
    cliffDate:     cliffBps > 0 ? fmtDate(f.cliff_ts_ms) : null,
    cliffPct:      cliffBps / 100,
    linearStart:   cliffBps < 10000 ? fmtDate(f.linear_start_ms) : null,
    linearEnd:     cliffBps < 10000 ? fmtDate(f.linear_end_ms) : null,
    beneficiary:   !isMulti ? (f.beneficiary ?? null) : null,
    beneficiaries: isMulti ? (f.shares?.fields?.contents ?? f.shares?.contents ?? []).length : null,
    epochUrl:      `https://epochsui.com/vault/${vaultId}`,
    suiVisionUrl:  `${suiBase}/object/${vaultId}`,
  }
}
