import { SuiAgentKit } from "../../agent";

/**
 * Get the agents wallet address
 * @param agent - SuiAgentKit instance
 * @returns string
 */
export function get_wallet_address(agent: SuiAgentKit) {
  return agent.wallet_address;
}
