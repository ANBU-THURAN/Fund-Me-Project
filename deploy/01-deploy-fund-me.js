// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre;
// the line below is the same as the above two lines.

const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const chainName = network.name;

    //we can do const address = 0xFFFFFFFFFFFFFFFFFFFF
    //but what we are trying to do is
    //if chainId == Y use address A
    //if chainId == X use address B
    //and so on
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(chainName)) {
        // if localhost or hardhat
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        //we can get previously deployed contracts using deployments.get() in hardhat-deploy
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedAddress"];
    }

    //when going for localhost or hardhat network, we want to use a mock.
    //if the contract doesn't exist, we are going to create a minimal version of it for our local testing

    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // FundMe contract's constructor arguments - put the priceFeed address here.
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    //because we don't want to verify our mock contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log(`Verifying contract ${fundMe.address} ${args}`);
        //not a mock contract and we have a etherscan api key -> do the verification
        await verify(fundMe.address, args);
        log("Verified contract");
    }
};

module.exports.tags = ["all", "fundme"];
