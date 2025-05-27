import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export const maxDecryptionDelay = 1800; // 30 minutes

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("Fomo", {
    from: deployer,
    args: [maxDecryptionDelay],
    log: true,
  });

  console.log(`Fomo contract: `, deployed.address);
};
export default func;
func.id = "deploy_Fomo"; // id required to prevent reexecution
func.tags = ["Fomo"];
