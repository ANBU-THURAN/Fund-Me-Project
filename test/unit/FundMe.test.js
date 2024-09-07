const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe("FundMe", function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.parseEther("1"); // this is the replacement
          //need to find the replacement for the below in newer versions.
          //or we can use formatEther to make the parsing easier
          //const sendValue = ethers.formatUnits("1");

          beforeEach(async function () {
              //Another way to get accounts using ethers.
              const accounts = await ethers.getSigners();
              deployer = accounts[0];

              //deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);

              const FundMeDeployment = await deployments.get("FundMe");
              fundMe = await ethers.getContractAt(
                  FundMeDeployment.abi,
                  FundMeDeployment.address,
                  deployer
              );
              const MockV3AggregatorDeployment = await deployments.get(
                  "MockV3Aggregator"
              );
              mockV3Aggregator = await ethers.getContractAt(
                  MockV3AggregatorDeployment.abi,
                  MockV3AggregatorDeployment.address,
                  deployer
              );
          });

          describe("Constructor", function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.target);
              });
          });

          describe("fund", function () {
              it("fails if we send not enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough"
                  ); // this will break the test
              });

              it("updates the amount funded", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  );
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer.address);
              });
          });

          describe("withdraw", function () {
              beforeEach(async function () {
                  // to fund the contract , in order to test withdraw
                  await fundMe.fund({ value: sendValue });
              });

              // it("withdraw ETH from a single funder", async function () {
              //     const provider = ethers.getDefaultProvider();
              //     //Arrange
              //     const startingFundMeBalance = await provider.getBalance(
              //         fundMe.target
              //     );
              //     const startingDeployerBalance = await provider.getBalance(
              //         deployer.address
              //     );

              //     //Act
              //     const transactionResponse = await fundMe.withdraw();
              //     const transactionReceipt = await transactionResponse.wait(1);
              //     const gasUsed = transactionReceipt.gasUsed;
              //     const gasPrice = transactionResponse.gasPrice;
              //     const gasCost = BigInt(gasUsed) * BigInt(gasPrice);

              //     //Assert
              //     const endingFundMeBalance = await provider.getBalance(
              //         fundMe.target
              //     );
              //     const endingDeployerBalance = await provider.getBalance(
              //         deployer.address
              //     );
              //     assert.equal(
              //         BigInt(startingDeployerBalance) + BigInt(startingFundMeBalance), // to add bigNumbers, we use add() instead of '+'
              //         BigInt(endingDeployerBalance) + BigInt(gasCost)
              //     );
              //     assert.equal(endingFundMeBalance, "0");
              //     // To assert that all the fundme balance is transferred to deployer.
              // });

              it("Only allows the owner to withdraw funds", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      })
    : describe.skip;
