const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    //const chainId = network.config.chainId; <--- this is not needed as we are checking with network.name

    // we just need to check if the network is not a testnet
    // we don't need to deploy this mock if the network has a pricefeed
    // we mention these chains in helper-hardhat-config

    if (developmentChains.includes(network.name)) {
        //deploy mock contracts
        log("Local network detected");
        log(`${deployer}  ${DECIMALS}  ${INITIAL_ANSWER}`);
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // arguments of MockV3Aggregator, we are adding args in helper-hardhat-config
        });
    }
};

module.exports.tags = ["all", "mocks"];
