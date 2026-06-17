import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'MyOFTAdapter'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments, network } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${network.name}`)
    console.log(`Deployer: ${deployer}`)

    const tokenAddress = network.config.oftAdapter?.tokenAddress
    assert(tokenAddress, `Missing oftAdapter.tokenAddress for network ${network.name}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            tokenAddress,
            endpointV2Deployment.address,
            deployer,
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
