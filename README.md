# OFT — Omnichain Fungible Token (LayerZero V2)

Cross-chain token transfer using LayerZero V2. Current configuration: **Base ↔ BSC mainnet**.

## Stack

- Solidity 0.8.22
- Hardhat + Foundry
- LayerZero V2 (`@layerzerolabs/oft-evm` ^4.0.1)
- OpenZeppelin v5

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.sample .env
```

Fill in `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | ✅ | Deployer wallet private key |
| `MNEMONIC` | ❌ | Alternative to PRIVATE_KEY |
| `RPC_URL_BSC` | ❌ | BSC RPC (default: `https://bsc-rpc.publicnode.com`) |
| `RPC_URL_BASE` | ❌ | Base RPC (default: public Base RPC) |

### 3. Compile

```bash
npx hardhat compile
```

## Contracts

| Contract | Chain | Description |
|----------|-------|-------------|
| `MyOFT` | BSC | Native OFT token with mint capability |
| `MyOFTAdapter` | Base | Adapter to wrap existing ERC-20 (`0x182FA643E5f29d5EcA75e7b9CF9336A3fe4620b2`) |

## Deploy

### Deploy MyOFT (BSC)

```bash
npx hardhat deploy --tags MyOFT --network bsc-mainnet
```

### Deploy MyOFTAdapter (Base)

Make sure `oftAdapter.tokenAddress` in `hardhat.config.ts` is correct.

```bash
npx hardhat deploy --tags MyOFTAdapter --network base
```

### Wire (set pathway)

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

## Bridge / Send Token

### Send tokens cross-chain

```bash
npx hardhat lz:oft:send \
  --src-eid 30184 \
  --dst-eid 30102 \
  --amount 5.68495 \
  --to <DESTINATION_ADDRESS> \
  --oapp-config layerzero.config.ts \
  --oft-address <OFT_CONTRACT_ADDRESS> \
  --network bsc-mainnet
```

**Endpoint IDs:**

| Chain | EID |
|-------|-----|
| BSC Mainnet | `30184` |
| Base Mainnet | `30102` |
| Ethereum Mainnet | `30101` |
| Arbitrum Mainnet | `30110` |

### Bridge existing token (hardcoded)

```bash
npx hardhat bridge --network bsc-mainnet
```

## Testing

```bash
# Hardhat tests
npx hardhat test

# Foundry tests
forge test

# All
npm test
```

## Project Structure

```
contracts/
├── MyOFT.sol              # Native OFT
├── MyOFTAdapter.sol       # OFT adapter for existing ERC-20

deploy/
├── MyOFT.ts
└── MyOFTAdapter.ts

tasks/
├── index.ts               # Task entry point
├── sendOFT.ts             # lz:oft:send
├── sendEvm.ts             # EVM send logic
├── bridgeExisting.ts      # bridge (hardcoded addresses)
├── types.ts
└── utils.ts

layerzero.config.ts         # Wiring config Base <-> BSC
hardhat.config.ts           # Network & compiler config
```

## Contract Addresses (Mainnet)

| Contract | Address |
|----------|---------|
| OFT (BSC & Base) | `0x500A02a20B0B0A3F3efCCFc0559543F5743bd1C4` |
| O Token (Base) | `0x182FA643E5f29d5EcA75e7b9CF9336A3fe4620b2` |

## License

MIT
