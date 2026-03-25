# MedAI Smart Contracts

## Overview
Smart contracts for handling healthcare payments on the MedAI platform using Ethereum blockchain.

## Contracts

### MedAIPayment.sol
Main payment contract for processing consultation fees and managing provider balances.

**Features:**
- Secure payment processing with ETH
- 5% platform fee (configurable)
- 24-hour refund window
- Provider verification system
- Withdrawal mechanism for providers
- Emergency pause functionality
- Reentrancy protection

## Deployment

### Prerequisites
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

### Setup Hardhat

Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

### Deploy to Testnet (Sepolia)

1. Get test ETH from faucet: https://sepoliafaucet.com/

2. Create deployment script `scripts/deploy.js`:
```javascript
const hre = require("hardhat");

async function main() {
  const MedAIPayment = await hre.ethers.getContractFactory("MedAIPayment");
  const medaiPayment = await MedAIPayment.deploy();
  await medaiPayment.deployed();

  console.log("MedAIPayment deployed to:", medaiPayment.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy to Mainnet

⚠️ **IMPORTANT**: Before mainnet deployment:
1. Complete security audit
2. Test thoroughly on testnet
3. Have emergency response plan
4. Ensure sufficient gas fees
5. Verify contract on Etherscan

```bash
npx hardhat run scripts/deploy.js --network polygon
```

## Integration with Frontend

### Add Contract Address to Environment

```env
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet
```

### Usage Example

```typescript
import { useContractWrite } from 'wagmi';
import { parseEther } from 'viem';

const { write } = useContractWrite({
  address: process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS,
  abi: MedAIPaymentABI,
  functionName: 'makePayment',
});

// Make payment
write({
  args: [appointmentId, providerAddress],
  value: parseEther('0.01'), // 0.01 ETH
});
```

## Security Considerations

1. **Auditing**: Get contract audited before mainnet deployment
2. **Testing**: Comprehensive test coverage required
3. **Upgradability**: Consider using proxy pattern for upgrades
4. **Gas Optimization**: Optimize for lower gas costs
5. **Access Control**: Verify all access modifiers
6. **Reentrancy**: Protected with OpenZeppelin's ReentrancyGuard

## Testing

Create `test/MedAIPayment.test.js`:
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedAIPayment", function () {
  // Add comprehensive tests here
});
```

Run tests:
```bash
npx hardhat test
```

## Gas Estimates

| Function | Estimated Gas |
|----------|---------------|
| makePayment | ~80,000 |
| refundPayment | ~50,000 |
| withdrawProviderBalance | ~40,000 |
| addVerifiedProvider | ~45,000 |

## Roadmap

- [ ] Deploy to Sepolia testnet
- [ ] Integration testing with frontend
- [ ] Security audit
- [ ] Deploy to Polygon mainnet
- [ ] Add support for ERC-20 tokens (USDC, USDT)
- [ ] Implement subscription payments
- [ ] Add dispute resolution mechanism

## Support

For contract-related questions: contracts@medai.app
