import 'hardhat/types'

declare module 'hardhat/types' {
    interface HttpNetworkUserConfig {
        oftAdapter?: {
            tokenAddress?: string
        }
    }
}
