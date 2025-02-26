import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
// import { mainnet, arbitrum } from 'wagmi/chains'  // 删除或注释掉未使用的导入

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694" // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const metadata = {
  name: 'Bank dApp',
  description: 'Bank Contract Example',
  url: 'https://reown.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [sepolia] as [AppKitNetwork, ...AppKitNetwork[]]  // 只使用 sepolia 测试网

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig