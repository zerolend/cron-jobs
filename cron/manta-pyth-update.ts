import dotenv from "dotenv";
import { createWalletClient, http, getContract } from "viem";
import { manta } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import cron from "node-cron";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

import abi from "./abi/pyth.json";

dotenv.config();

export const priceIdsUSD = {
  busd: "0x5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814",
  cbeth: "0x15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717",
  dai: "0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd",
  eth: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  lusd: "0xc9dc99720306ef43fd301396a6f8522c8be89c6c77e8c27d87966918a943fd20",
  matic: "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52",
  pepe: "0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4",
  reth: "0xa0255134973f4fdf2f8f7808354274a3b1ebc6ee438be898d045e8b56ba1fe13",
  tia: "0x09f7c1d7dfbb7df2b8fe3d3d87ee94a2259d212da4f30c1f0540d066dfa44723",
  usdc: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
  usdt: "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
  wbtc: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  wsteth: "0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784",
  manta: "0xc3883bcf1101c111e9fcfe2465703c47f2b638e21fef2cce0502e6c8f416e0e2",
};

export const pythContracts = {
  manta: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  zksync: "0xf087c864AEccFb6A2Bf1Af6A0382B0d0f6c5D834",
  blastSepolia: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
  blast: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
};

// An example of a deploy script that will deploy and call a simple contract.
const main = async function () {
  console.log(`Running script for FeesClaimer`);

  const account = privateKeyToAccount(
    process.env.WALLET_PRIVATE_KEY as `0x${string}`
  );

  console.log("i am", account.address);

  // 2. Set up your client with desired chain & transport.
  const walletClient = createWalletClient({
    account,
    chain: manta,
    transport: http(),
  });

  const contract = getContract({
    address: "0x0Bd27617E20F09a8E7FFdaE281E383b4b2f7A742",
    abi,
    // 1a. Insert a single client
    client: walletClient,
  });

  const updateData = [
    priceIdsUSD.eth,
    priceIdsUSD.usdc,
    priceIdsUSD.usdt,
    priceIdsUSD.wbtc,
    priceIdsUSD.tia,
    priceIdsUSD.manta,
  ];

  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  ); // See Hermes endpoints section below for other endpoints

  const priceUpdateData = (await connection.getPriceFeedsUpdateData(
    updateData
  )) as any;

  const tx = await contract.write.updateFeeds([priceUpdateData], {
    value: 10000n,
  });
  console.log(tx);
};

main();
cron.schedule("0 * * * *", main);
