//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //get the price of eth in terms of USD.
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //ABI -
        //Address - 0x694AA1769357215DE4FAC081bf1f309aDC325306
        (, int256 price, , , ) = priceFeed.latestRoundData();
        //price - ETH in terms of USD
        //3000.00000000
        return uint256(price * 1e10); // 1 ** 10 = 10000000000 -> we are converting to wei.
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //takes number of eth as input and returns value in USD
        uint256 ethPrice = getPrice(priceFeed);
        //3000_000000000000000000 -> 3000 but it will have 18 zeroes as it is in wei.
        return (ethAmount * ethPrice) / 1e18; // both ethAmount and ethPrice are in wei, so if we don't divide we will have 36 extra places
    }
}
