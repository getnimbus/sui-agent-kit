import { Transaction } from '@mysten/sui/transactions'
import type { SuiAgentKit } from '../../agent/index'
import { EPOCH_CONFIGS, CLOCK_ID, getNetwork } from './utils'

export async function epoch_claim_vault(
  agent:     SuiAgentKit,
  vaultId:   string,
  tokenType: string,
  isMulti:   boolean = false,
): Promise<{ digest: string }> {
  const network = getNetwork(agent.client)
  const cfg     = EPOCH_CONFIGS[network]
  const entry   = isMulti ? 'claim_multi' : 'claim'

  const tx = new Transaction()
  tx.moveCall({
    target: `${cfg.PACKAGE_ID}::vesting::${entry}`,
    typeArguments: [tokenType],
    arguments: [tx.object(vaultId), tx.object(CLOCK_ID)],
  })

  const result = await agent.client.signAndExecuteTransaction({ signer: agent.wallet, transaction: tx })
  const waited = await agent.client.waitForTransaction({ digest: result.digest, options: { showEffects: true } })
  if (waited.effects?.status?.status === 'failure')
    throw new Error(`Claim failed: ${waited.effects.status.error}`)

  return { digest: result.digest }
}
