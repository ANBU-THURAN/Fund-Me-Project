const networkConfig = {
    11155111: {
        name: "Sepolia",
        ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        // get priceFeed addresses from https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1
    },
    //other chainID -> network address.
};

const developmentChains = ["hardhat", "localhost"];

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
