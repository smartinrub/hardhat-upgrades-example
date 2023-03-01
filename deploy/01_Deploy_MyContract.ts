import { DeployFunction } from "hardhat-deploy/dist/types"
import { network } from "hardhat"
import {
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import { verify } from "../utils/verify"

const deployFunction: DeployFunction = async ({
    getNamedAccounts,
    deployments,
}) => {
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts()
    const chainId: number | undefined = network.config.chainId
    if (!chainId) return

    const waitBlockConfirmations: number = developmentChains.includes(
        network.name
    )
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    const myContract = await deploy("MyContract", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
        proxy: {
            proxyContract: "OptimizedTransparentProxy",
        },
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(myContract.address, [])
    }
    log(`----------------------------------------------------`)
}

export default deployFunction
deployFunction.tags = ["all", "my-contract", "main"]
