<div align="center">

# Sui Agent Kit

</div>

An open-source toolkit for connecting AI agents to Sui protocols. Now, any agent, using any model can autonomously perform 15+ Sui actions:

_Powered by [Nimbus](https://docs.getnimbus.io/)_

- Trade tokens
- Launch new tokens
- Lend assets
- Staking tokens
- Launch tokens on AMMs
- And more...

Anyone - whether an SF-based AI researcher or a crypto-native builder - can bring their AI agents trained with any model and seamlessly integrate with Sui.

## Demo

https://www.loom.com/share/b61c8f57e0104006bda16bc85e4b23dc

## 📃 Documentation
You can view the full documentation of the kit at [https://docs.getnimbus.io/sui-ai-agent/introduction](https://docs.getnimbus.io/sui-ai-agent/introduction)

## 📦 Installation

```bash
npm install @getnimbus/sui-agent-kit
```

## Quick Start

```typescript
import { SuiAgentKit, createSuiTools } from "@getnimbus/sui-agent-kit";

// Initialize with private key and optional RPC URL
const agent = new SuiAgentKit(
  "your-wallet-private-key",
  "https://fullnode.mainnet.sui.io",
  "your-openai-api-key"
);

// Create LangChain tools
const tools = createSuiTools(agent);
```
