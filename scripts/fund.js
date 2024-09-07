const { deployments, ethers } = require("hardhat");

//Script to fund our FundMe contract
async function main() {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const FundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt(
        FundMeDeployment.abi,
        FundMeDeployment.address,
        deployer
    );

    console.log("Funding contract... " + fundMe.target);

    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    });

    await transactionResponse.wait(1);

    console.log("Funded contract !");
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
