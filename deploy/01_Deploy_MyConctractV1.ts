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
    const myContractV1 = await deploy("MyContractV1", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            // the proxy contract is owned by an admin contract (best practice)
            viaAdminContract: {
                name: "MyContractProxyAdmin",
                artifact: "MyContractProxyAdmin",
            },
        },
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(myContractV1.address, [])
    }
    log(`----------------------------------------------------`)
}

export default deployFunction
deployFunction.tags = ["all", "my-contract-v1", "main"]
