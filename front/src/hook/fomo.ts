import { getAddress } from "viem";
import { useReadContract } from "wagmi";

import Fomo from "@/abi/Fomo.json";

export function useLastPoolTime() {
  return useReadContract({
    address: getAddress(process.env.NEXT_PUBLIC_CONTRACT!),
    abi: Fomo.abi,
    functionName: "lastPoolPrizeTime",
    query: {
      enabled: !!process.env.NEXT_PUBLIC_CONTRACT, // Only enable when address exists
    },
  });
}

// export function useAllowance(
//   tokenAddress: Address | string | undefined,
//   args: [`0x${string}`, `0x${string}`]
// ) {
//   return useReadContract({
//     address: getAddress(tokenAddress!),
//     abi: erc20Abi,
//     functionName: "allowance",
//     args,
//     query: {
//       enabled: !!tokenAddress, // Only enable when address exists
//     },
//   });
// }

// export function useEncryptedBalance(
//   tokenAddress: Address | string | undefined,
//   userAccount: Address | string | undefined
// ) {
//   // TODO:
//   // https://docs.zama.ai/fhevm/smart-contract/decryption/reencryption

//   return useReadContract({
//     address: getAddress(tokenAddress!),
//     abi: ConfidentialLendingLayer.abi,
//     functionName: "balanceOf",
//     args: [userAccount!],
//     query: {
//       enabled: !!tokenAddress && !!userAccount,
//     },
//   });
// }

// export function displayBalance({
//   value,
//   decimals,
// }: {
//   value: bigint;
//   decimals: number;
// }) {
//   const formattedAmount = formatUnits(value, decimals);
//   return new Intl.NumberFormat("en-US", {
//     style: "decimal",
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//     useGrouping: true,
//   }).format(BigInt(formattedAmount));
// }
