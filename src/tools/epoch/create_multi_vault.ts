import { Transaction } from '@mysten/sui/transactions'
import type { SuiAgentKit } from '../../agent/index'
import { EPOCH_CONFIGS, CLOCK_ID, getNetwork, dateToMs, toBaseUnits, getDecimals, getDeployFee } from './utils'

export interface CreateMultiVaultParams {
  tokenType:     string
  amount:        string
  beneficiaries: Array<{ address: string; sharePct: number }> // must sum to 100
  endDate:       string
  cliffDate?:    string
  cliffPct?:     number
  startDate?:    string
}

export async function epoch_create_multi_vault(
  agent:  SuiAgentKit,
  params: CreateMultiVaultParams,
): Promise<{ vaultId: string; digest: string }> {
  const total = params.beneficiaries.reduce((s, b) => s + b.sharePct, 0)
  if (Math.abs(total - 100) > 0.01)
    throw new Error(`Beneficiary percentages must sum to 100 (got ${total.toFixed(2)})`)

  const network  = getNetwork(agent.client)
  const cfg      = EPOCH_CONFIGS[network]
  const decimals = await getDecimals(agent.client, params.tokenType)
  const amtMist  = toBaseUnits(params.amount, decimals)
  const cliffPct = params.cliffPct ?? 0

  const cliffTsMs  = params.cliffDate ? dateToMs(params.cliffDate) : 0n
  const linStartMs = params.startDate
    ? dateToMs(params.startDate)
    : (params.cliffDate ? cliffTsMs : 0n)
  const linEndMs   = dateToMs(params.endDate)
  const cliffBps   = BigInt(Math.round(cliffPct * 100))
  const addresses  = params.beneficiaries.map(b => b.address)
  const sharesBps  = params.beneficiaries.map(b => BigInt(Math.round(b.sharePct * 100)))

  const deployFee = await getDeployFee(agent.client, network)
  const tx = new Transaction()
  const [fee] = tx.splitCoins(tx.gas, [tx.pure.u64(deployFee)])

  let tokens: any
  if (params.tokenType === '0x2::sui::SUI') {
    ;[tokens] = tx.splitCoins(tx.gas, [tx.pure.u64(amtMist)])
  } else {
    const coins = await agent.client.getCoins({ owner: agent.wallet_address, coinType: params.tokenType })
    if (!coins.data.length) throw new Error(`No ${params.tokenType} coins in wallet`)
    const primary = tx.object(coins.data[0].coinObjectId)
    if (coins.data.length > 1)
      tx.mergeCoins(primary, coins.data.slice(1).map(c => tx.object(c.coinObjectId)))
    ;[tokens] = tx.splitCoins(primary, [tx.pure.u64(amtMist)])
  }

  tx.moveCall({
    target: `${cfg.PACKAGE_ID}::vesting::create_multi_vault`,
    typeArguments: [params.tokenType],
    arguments: [
      tx.object(cfg.TREASURY_ID),
      fee,
      tokens,
      tx.pure.vector('address', addresses),
      tx.pure.vector('u64', sharesBps),
      tx.pure.u64(cliffTsMs),
      tx.pure.u64(cliffBps),
      tx.pure.u64(linStartMs),
      tx.pure.u64(linEndMs),
      tx.object(CLOCK_ID),
    ],
  })

  const result = await agent.client.signAndExecuteTransaction({ signer: agent.wallet, transaction: tx })
  const full   = await agent.client.waitForTransaction({
    digest: result.digest,
    options: { showObjectChanges: true, showEffects: true },
  })
  if (full.effects?.status?.status === 'failure')
    throw new Error(`Transaction failed: ${full.effects.status.error}`)

  const created = full.objectChanges?.find(
    c => c.type === 'created' && typeof c.objectType === 'string' && c.objectType.includes('MultiVestingVault'),
  )
  if (!created || !('objectId' in created)) throw new Error('MultiVault object not found in tx output')

  return { vaultId: created.objectId, digest: result.digest }
}
