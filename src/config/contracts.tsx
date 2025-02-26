import { erc20Abi } from 'viem'

// 合约地址
export const BANK_CONTRACT_ADDRESS = '0xAE90dcC4FE0A5198da3edA1De79B5B502AbeCA60' as `0x${string}`;
export const ERC20_ADDRESS = '0xC5E67BfA4dB90b4a3fcd803a224dF3d9099c3E00' as `0x${string}`;

// Bank 合约 ABI
export const BANK_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address","name": "_token","type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address","name": "","type": "address"}],
    "name": "balances",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export { erc20Abi }  // 重新导出 viem 的 erc20Abi 