import { SuiAgentKit } from "./index";
import dotenv from "dotenv";
dotenv.config();

// (async () => {
//   const privateKey = process.env.SUI_PRIVATE_KEY || "";
//   const rpcUrl = process.env.RPC_URL || "";
//   const openaiApiKey = process.env.OPENAI_API_KEY || "";

//   const agent = new SuiAgentKit(privateKey, rpcUrl, openaiApiKey);
//   // const balance = await agent.getHoldings();
//   // console.log(balance);

//   const pool = await agent.createPoolCetusCLMM({
//     coinTypeA:
//       "0x92aad4e078dded45773628adc3a9977d546b178bdadabcae351ce1818c5bb1fb::sc::SC",
//     coinTypeB: "0x2::sui::SUI",
//     initializePrice: 1,
//     tickSpacing: 10,
//     inputTokenAmount: 1,
//     isTokenAInput: true,
//     slippage: 0.07,
//   });
//   console.log(pool);
// })();
