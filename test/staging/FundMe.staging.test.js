const { deployments, ethers, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

// to skip tests if not in test net . (i.e) we are in development chains
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe;
          let deployer;
          const sendValue = ethers.parseEther("0.1");

          beforeEach(async function () {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              // we don't need to deploy in test net, as we are assuming it is already deployed.
              //Also, there are no mocks in test net.

              const FundMeDeployment = await deployments.get("FundMe");
              fundMe = await ethers.getContractAt(
                  FundMeDeployment.abi,
                  FundMeDeployment.address,
                  deployer
              );
          });

          it("updates amount funded in mapping", async function () {
              await fundMe.fund({ value: sendValue });
              const response = await fundMe.getAddressToAmountFunded(
                  deployer.address
              );
              assert.equal(response.toString(), sendValue.toString());
          });
      });
