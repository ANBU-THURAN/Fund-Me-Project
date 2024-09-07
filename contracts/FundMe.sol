//SPDX-License-Identifier: MIT

//This contract is supposed to
//Get Funds from users
//withdraw funds
//Set a minimum funding value in USD

//Pragma
pragma solidity ^0.8.8;

//Imports
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//Errors
error FundMe__NotOwner(); // best practice to name errors -> nameOfContract_Error

/**
 * @title A contract for crowd funding
 * @author Anbu Thuran
 * @notice This contract is to demo a sample funding contract
 * @dev This implements Price feeds as our library
 */
contract FundMe {
    //Type Declarations
    using PriceConverter for uint256;

    //State variables
    uint256 public constant minimumUsd = 50 * 1e18;

    //Array of funders who funded this
    address[] private s_funders;

    mapping(address => uint256) private s_addressToAmountMapping; //add s_ to represent a storage variable

    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Not allowed");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    function fund() public payable {
        //want to be able to set a min fund amount in USD
        require(
            msg.value.getConversionRate(s_priceFeed) >= minimumUsd,
            "Didn't send enough"
        );

        //msg.sender -> contains the address of the initiator of transaction
        s_funders.push(msg.sender);

        s_addressToAmountMapping[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address currentAddress = s_funders[funderIndex];
            s_addressToAmountMapping[currentAddress] = 0;
        }
        s_funders = new address[](0);

        //There are three ways to send currency from contract
        //1. transfer
        //   payable(msg.sender).transfer(address(this).balance);
        //2. send
        //   bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //   require(sendSuccess, "Send failed!");
        //3. call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        uint256 fundersLength = funders.length;
        for (
            uint256 funderIndex = 0;
            funderIndex < fundersLength;
            funderIndex++
        ) {
            address currentAddress = funders[funderIndex];
            s_addressToAmountMapping[currentAddress] = 0;
        }

        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");

        require(callSuccess, "Call failed");
    }

    //What if someone sends eth to this contract without calling the fund() function

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funderAddress
    ) public view returns (uint256) {
        return s_addressToAmountMapping[funderAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
