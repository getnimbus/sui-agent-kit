// import { IStakingParams } from "../types/farming";
// import { SuiAgentKit } from "./index";
// import dotenv from "dotenv";
// dotenv.config();

// (async () => {
//   const privateKey = process.env.SUI_PRIVATE_KEY || "";
//   const rpcUrl = process.env.RPC_URL || "";
//   const openaiApiKey = process.env.OPENAI_API_KEY || "";

//   const agent = new SuiAgentKit(privateKey, rpcUrl, openaiApiKey);
//   const params: IStakingParams = {
//     amount: 0.1,
//     symbol: "sSUI",
//     type: "STAKING",
//     sender: agent.wallet_address,
//     poolId:
//       "suilend-lending:0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
//     isStakeAndDeposit: true,
//   };
//   const res = await agent.stakeSuilend(params);
//   console.log(res);
// })();
