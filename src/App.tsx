import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BankApp from './components/BankApp'
import { projectId, metadata, networks, wagmiAdapter } from './config'
import "./App.css"

const queryClient = new QueryClient()

const generalConfig = {
  projectId: projectId,
  networks: networks,
  metadata: metadata,
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-accent': '#000000',
  }
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function App() {
  return (
    <div className="app">
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <BankApp />
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default App