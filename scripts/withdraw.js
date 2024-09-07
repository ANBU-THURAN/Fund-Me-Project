const { deployments, ethers } = require("hardhat");

//script to withdraw from our contract
async function main() {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const FundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt(
        FundMeDeployment.abi,
        FundMeDeployment.address,
        deployer
    );

    console.log("Withdrawing...");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Withdraw successful");
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
