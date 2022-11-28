import { ethers } from "ethers";
import { config, wssProvider } from "../Config/config";
import { Overloads } from "../contents/interface";

const signer = new ethers.Wallet(config.PRIVATE_KEY);
const account = signer.connect(wssProvider);
const MAX_INT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

///approve the ABI
const abi = [
  " function approve(address spender, uint value) external returns (bool)"
];

export const Approve = async (token: string, overloads: Overloads) => {
  delete overloads.value;
  overloads["nonce"]! += 1;

  try {
    let contract = new ethers.Contract(token, abi, account);
    let tx = await contract.approve(
      config.UNISWAP_ROUTER,
      MAX_INT,
      overloads
    );

    console.log(`#####buyApprove Successfully#####`);
    console.log(`Transaction Hash:`, tx.hash);
    console.log(`####################`);

    return { success: true, data: tx.hash };
  } catch (error) {
    console.log("There was an error approving the token", error);
  }
};
