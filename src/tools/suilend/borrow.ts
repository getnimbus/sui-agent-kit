// import { SuiAgentKit, TransactionResponse } from "../../index";
// import logger from "../../utils/logger";

// import { IBorrowParams } from "../../types/farming";
// import { Transaction } from "@mysten/sui/transactions";
// import { getSuilendSdkData } from "./util";
// import { get_holding } from "../sui/token/get_balance";

// /**
//  * Stake SUI into Suilend
//  * @param agent - SuiAgentKit instance
//  * @param params - IStakingParams
//  * @returns Promise resolving to the transaction hash
//  */

// // NOT COMPLETED
// export async function borrow_suilend(
//   agent: SuiAgentKit,
//   params: IBorrowParams,
// ): Promise<TransactionResponse> {
//   try {
//     const client = agent.client;

//     const tx = await getTransactionPayload(agent, params);

//     const txExec = await client.signAndExecuteTransaction({
//       signer: agent.wallet,
//       transaction: tx,
//     });

//     // wait for the transaction to be executed
//     const res = await client.waitForTransaction({
//       digest: txExec.digest,
//       options: {
//         showEffects: true,
//       },
//     });

//     return {
//       tx_hash: txExec.digest,
//       tx_status: res.effects?.status.status || "unknown",
//       // tx_hash: "",
//       // tx_status: "success",
//     };
//   } catch (error: any) {
//     logger.error(error);
//     throw new Error(`Failed to stake SUI into Suilend: ${error.message}`);
//   }
// }

// const getTransactionPayload = async (
//   agent: SuiAgentKit,
//   params: IBorrowParams,
// ): Promise<Transaction> => {
//   try {
//     const transaction = new Transaction();

//     let amount = Number(params.amount);
//     if (amount <= 0) {
//       throw new Error("Amount must be greater than 0");
//     }

//     // TODO: check collateral
//     // check balance
//     const balancesMetadata = await get_holding(agent);

//     const tokenData = balancesMetadata.find(
//       (r) => r.symbol === params.collateral,
//     );

//     if (!tokenData) {
//       throw new Error("Token not found in your wallet");
//     }

//     amount = Number(params.amount) * 10 ** (tokenData?.decimals || 9);

//     const appData: any = await getSuilendSdkData(agent);

//     const obligation = appData?.obligations?.[0];
//     const obligationOwnerCap = appData?.obligationOwnerCaps?.find(
//       (o: any) => o?.obligationId === obligation?.id,
//     );

//     const lstDataBorrow = appData?.lstDataMap[params.collateral] || {};

//     const coinBorrow =
//       appData?.lendingMarket?.reserves.find(
//         (r: any) => r.symbol === params.collateral,
//       ) || lstDataBorrow?.token;

//     if (!coinBorrow) {
//       throw new Error("This token is not supported for borrowing");
//     }

//     await appData?.suilendClient.borrowAndSendToUser(
//       agent.wallet_address,
//       obligationOwnerCap.id,
//       obligation.id,
//       coinBorrow.coinType,
//       amount * 10 ** (coinBorrow.decimals || 9),
//       transaction,
//     );

//     return transaction;
//   } catch (e) {
//     logger.error(e);
//     throw new Error(`Failed to get transaction payload: ${e}`);
//   }
// };
