import { task, types } from 'hardhat/config'
import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { Options, addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { EndpointId } from '@layerzerolabs/lz-definitions'

const OFT_ADAPTER_BASE = '0x500A02a20B0B0A3F3efCCFc0559543F5743bd1C4'
const OFT_BSC = '0x500A02a20B0B0A3F3efCCFc0559543F5743bd1C4'
const O_TOKEN_BASE = '0x182FA643E5f29d5EcA75e7b9CF9336A3fe4620b2'

const CHAINS: Record<string, { eid: number; rpcEnv: string; label: string }> = {
    base: { eid: EndpointId.BASE_V2_MAINNET, rpcEnv: 'RPC_URL_BASE', label: 'Base' },
    bsc: { eid: EndpointId.BSC_V2_MAINNET, rpcEnv: 'RPC_URL_BSC', label: 'BSC' },
}

task('bridge', 'Bridge O tokens between Base and BSC using existing contracts')
    .addParam('src', 'Source chain: base or bsc', undefined, types.string)
    .addParam('dst', 'Dest chain: base or bsc', undefined, types.string)
    .addParam('amount', 'Amount in human-readable units (e.g. 1.5)', undefined, types.string)
    .addParam('to', 'Recipient address on destination chain', undefined, types.string)
    .setAction(async (args: { src: string; dst: string; amount: string; to: string }, hre: HardhatRuntimeEnvironment) => {
        const src = CHAINS[args.src]
        const dst = CHAINS[args.dst]
        if (!src || !dst) throw new Error(`Invalid chain. Use: ${Object.keys(CHAINS).join(', ')}`)
        if (src.eid === dst.eid) throw new Error('Source and destination must be different')
        if (!/^0x[0-9a-fA-F]{40}$/.test(args.to)) throw new Error('Invalid recipient address')

        const [signer] = await hre.ethers.getSigners()
        console.log(`\n  From: ${signer.address}`)
        console.log(`  To:   ${args.to}`)
        console.log(`  Amt:  ${args.amount} O`)
        console.log(`  Path: ${src.label} (EID ${src.eid}) → ${dst.label} (EID ${dst.eid})\n`)

        const contractAddr = args.src === 'base' ? OFT_ADAPTER_BASE : OFT_BSC
        const oftArtifact = await hre.artifacts.readArtifact('OFT')
        const oft = await hre.ethers.getContractAt(oftArtifact.abi, contractAddr, signer)

        const tokenAddr = args.src === 'base' ? O_TOKEN_BASE : contractAddr
        const erc20 = await hre.ethers.getContractAt('ERC20', tokenAddr, signer)
        const innerDecimals = await erc20.decimals()
        const SHARED_DECIMALS = 6
        const decimalConversion = BigInt(10) ** BigInt(innerDecimals - SHARED_DECIMALS)

        const rawAmount = parseUnits(args.amount, innerDecimals)
        const rawAmountBigInt = BigInt(rawAmount.toString())
        const dustRemoved = (rawAmountBigInt / decimalConversion) * decimalConversion
        const amountLD = BigNumber.from(dustRemoved.toString())
        console.log(`  Amount with dust removed: ${hre.ethers.utils.formatUnits(amountLD, innerDecimals)}\n`)

        const dstBytes32 = addressToBytes32(args.to)

        if (args.src === 'base') {
            const allowance = await erc20.allowance(signer.address, contractAddr)
            if (allowance.lt(amountLD)) {
                console.log('  Approving O token for OFTAdapter...')
                const tx = await erc20.approve(contractAddr, amountLD)
                await tx.wait()
                console.log(`  ✓ Approved (tx: ${tx.hash})\n`)
            } else {
                console.log('  ✓ Allowance sufficient\n')
            }
        }

        let options = Options.newOptions()
        options = options.addExecutorLzReceiveOption(80000, 0)
        const extraOptions = options.toHex()

        const sendParam = {
            dstEid: dst.eid,
            to: dstBytes32,
            amountLD: amountLD.toString(),
            minAmountLD: amountLD.toString(),
            extraOptions,
            composeMsg: '0x',
            oftCmd: '0x',
        }

        console.log('  Quoting fee...')
        const fee = await oft.quoteSend(sendParam, false)
        console.log(`  Native fee: ${hre.ethers.utils.formatEther(fee.nativeFee)} ETH\n`)

        console.log('  Sending...')
        const tx = await oft.send(sendParam, fee, signer.address, { value: fee.nativeFee })
        const receipt = await tx.wait()
        console.log(`\n  ✓ Sent!`)
        console.log(`    Tx: ${receipt.transactionHash}`)
        console.log(`    LZ Scan: https://layerzeroscan.com/tx/${receipt.transactionHash}`)
    })
