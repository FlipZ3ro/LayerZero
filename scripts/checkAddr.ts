import { config } from 'dotenv'
config()
import { Wallet } from 'ethers'
const pk = process.env.PRIVATE_KEY
if (pk) {
  const w = new Wallet(pk)
  console.log('Deployer:', w.address)
} else {
  console.log('No PRIVATE_KEY in .env')
}
