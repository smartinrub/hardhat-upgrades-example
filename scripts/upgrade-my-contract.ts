import { ContractTransaction } from "ethers"
import { ethers } from "hardhat"
import {
    MyContract,
    MyContractV2,
    ProxyAdmin,
    TransparentUpgradeableProxy,
} from "../typechain"

async function main() {
    const proxyAdmin: ProxyAdmin = await ethers.getContract("DefaultProxyAdmin")
    const transparentProxy: TransparentUpgradeableProxy =
        await ethers.getContract("MyContract_Proxy")

    // V1
    const implementation = await proxyAdmin.getProxyImplementation(
        transparentProxy.address
    )
    const proxyMyContract: MyContract = await ethers.getContractAt(
        "MyContract", // abi
        transparentProxy.address
    )
    const contractVersion = await proxyMyContract.version()
    console.log(
        `Implementation (${implementation}) version is: ${contractVersion}`
    )

    const myContractV2: MyContractV2 = await ethers.getContract("MyContractV2")
    const upgradeTx: ContractTransaction = await proxyAdmin.upgrade(
        transparentProxy.address,
        myContractV2.address
    )
    await upgradeTx.wait(1)

    // V2
    const implementationV2 = await proxyAdmin.getProxyImplementation(
        transparentProxy.address
    )
    const proxyMyContractV2: MyContractV2 = await ethers.getContractAt(
        "MyContractV2", // V2 abi
        transparentProxy.address
    )
    const newContractVersion = await proxyMyContractV2.version()
    console.log(
        `Implementation (${implementationV2}) version is: ${newContractVersion}`
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
