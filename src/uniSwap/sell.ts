import { ethers } from "ethers";
import { walletAddress } from "../Config/config";
import { Contract } from "../contents/common";
import { Overloads } from "../contents/interface";

// swapExactTokensForETH

export const sellToken = async (
  path: string[],
  overLoads: Overloads,
  amountIn: any,
  amountOutMin: any
) => {
  try {
    path = [...path].reverse();
    // console.log({ path });
    let deadline = Math.floor(Date.now() / 1000) + 60 * 2;
    // let amountOutMin = ethers.utils.parseEther("0");
    // let amountIn = ethers.utils.parseEther("0.1");
    // let to = walletAddress;
    const tx = await Contract.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      path,
      walletAddress,
      deadline,
      overLoads
    );
    //overloads include only  nonce, gasPrice, gasLimit
    console.log("**************SELL TRANSACTION***********************\n");
    console.log(tx);

    return { success: true, data: tx.hash };
  } catch (error) {
    console.log("Error swapping exact token for ETH", error);
    return { success: false, data: error };
  }
};
