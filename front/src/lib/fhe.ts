import { initFhevm, createInstance, FhevmInstance } from "fhevmjs/bundle";

let instance: FhevmInstance;

export const createFHEInstance = async () => {
  console.log("Create FHE Instance...");
  await initFhevm();
  instance = await createInstance({
    kmsContractAddress: "0x9D6891A6240D6130c54ae243d8005063D05fE14b",
    aclContractAddress: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5",
    // chainId: sepolia.id,
    gatewayUrl: "https://gateway.sepolia.zama.ai/",
    networkUrl: "https://eth-sepolia.public.blastapi.io",
    // networkUrl: process.env.NEXT_PUBLIC_CONTRACT!,
  });
  console.log("FHE Instance ready!");
};

export const getFHEInstance = (): FhevmInstance => {
  return instance;
};
