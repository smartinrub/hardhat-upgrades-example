import { expect } from "chai"
import { ContractTransaction } from "ethers"
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import {
    MyContract,
    MyContractV2,
    ProxyAdmin,
    TransparentUpgradeableProxy,
} from "../../typechain"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Upgrade MyContract Unit Tests", () => {
          let transparentProxy: TransparentUpgradeableProxy
          let proxyMyContractV1: MyContract
          let proxyMyContractV2: MyContractV2
          let proxyAdmin: ProxyAdmin
          beforeEach(async () => {
              await deployments.fixture(["all"])
              transparentProxy = await ethers.getContract("MyContract_Proxy")
              proxyMyContractV1 = await ethers.getContractAt(
                  "MyContract", // abi
                  transparentProxy.address
              )
              proxyMyContractV2 = await ethers.getContractAt(
                  "MyContractV2", // abi
                  transparentProxy.address
              )
              proxyAdmin = await ethers.getContract("DefaultProxyAdmin")
          })

          it("Should upgrade contract to V2", async () => {
              // GIVEN
              const contractV1Version = await proxyMyContractV1.version()
              expect(contractV1Version).to.equal(1)

              // WHEN
              const myContractV2: MyContractV2 = await ethers.getContract(
                  "MyContractV2"
              )
              const upgradeTx: ContractTransaction = await proxyAdmin.upgrade(
                  transparentProxy.address,
                  myContractV2.address
              )
              await upgradeTx.wait(1)

              // THEN
              const contractV2Version = await proxyMyContractV2.version()
              expect(contractV2Version).to.equal(2)
          })

          it("Should increment when upgraded to V2", async () => {
              // GIVEN
              const value = await proxyMyContractV2.getValue()
              expect(value).to.equal(0)
              const myContractV2: MyContractV2 = await ethers.getContract(
                  "MyContractV2"
              )
              const upgradeTx: ContractTransaction = await proxyAdmin.upgrade(
                  transparentProxy.address,
                  myContractV2.address
              )
              await upgradeTx.wait(1)

              // WHEN
              proxyMyContractV2.increment()

              // THEN
              const newValue = await proxyMyContractV2.getValue()
              expect(newValue).to.equal(1)
          })
      })
