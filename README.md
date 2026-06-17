# OFT — Omnichain Fungible Token (LayerZero V2)

Cross-chain token transfer menggunakan LayerZero V2. Konfigurasi saat ini: **Base ↔ BSC mainnet**.

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

Isi `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | ✅ | Private key wallet deployer |
| `MNEMONIC` | ❌ | Alternative ke PRIVATE_KEY |
| `RPC_URL_BSC` | ❌ | RPC BSC (default: public Binance RPC) |
| `RPC_URL_BASE` | ❌ | RPC Base (default: public Base RPC) |

### 3. Compile

```bash
npx hardhat compile
```

## Contracts

| Contract | Chain | Description |
|----------|-------|-------------|
| `MyOFT` | BSC | Token OFT native, bisa mint sendiri |
| `MyOFTAdapter` | Base | Adapter untuk wrap ERC-20 yang sudah ada (`0x182FA643E5f29d5EcA75e7b9CF9336A3fe4620b2`) |

## Deploy

### Deploy MyOFT (BSC)

```bash
npx hardhat deploy --tags MyOFT --network bsc-mainnet
```

### Deploy MyOFTAdapter (Base)

Pastikan `oftAdapter.tokenAddress` di `hardhat.config.ts` sudah benar.

```bash
npx hardhat deploy --tags MyOFTAdapter --network base
```

### Wire (set pathway)

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

## Bridge / Send Token

### Kirim token cross-chain

```bash
npx hardhat lz:oft:send \
  --src-eid 30184 \
  --dst-eid 30102 \
  --amount 5.68495 \
  --to <ADDRESS_TUJUAN> \
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

# Semua
npm test
```

## Project Structure

```
contracts/
├── MyOFT.sol              # OFT native
├── MyOFTAdapter.sol       # OFT adapter untuk existing ERC-20
└── mocks/                 # Mock contracts untuk testing

deploy/
├── MyOFT.ts
└── MyOFTAdapter.ts

tasks/
├── sendOFT.ts             # lz:oft:send
├── bridgeExisting.ts      # bridge
└── simple-workers-mock/   # Tasks untuk testnet (mock DVN/Executor)

layerzero.config.ts         # Wiring config Base <-> BSC
```

## Contract Addresses (Mainnet)

| Contract | Address |
|----------|---------|
| OFT (BSC & Base) | `0x500A02a20B0B0A3F3efCCFc0559543F5743bd1C4` |
| O Token (Base) | `0x182FA643E5f29d5EcA75e7b9CF9336A3fe4620b2` |

## License

MIT
