import { utils, ethers } from "ethers";
import ABI from "../utils/contract-abi.json";
import { config, SLIPPAGE, walletAddress, wssProvider } from "../Config/config";

export const abiInterface = new ethers.utils.Interface(ABI);
export const signer = new ethers.Wallet(config.PRIVATE_KEY);
export const account = signer.connect(wssProvider);
export const Contract = new ethers.Contract(
  config.UNISWAP_ROUTER,
  ABI,
  account
);
export const abi = [
  " function approve(address spender, uint value) external returns (bool)"
];
// export const contract = new ethers.Contract(config.UNISWAP_ROUTER, ABI);

export const getTransaction = async (tx: any) => {
  try {
    const txData = await wssProvider.getTransaction(tx);
    return txData;
  } catch (error) {
    console.log("sorry, cannot get tx data", error);
  }
};

export const getAmountOut = async (sellPath: string[], token: string) => {
  try {
    const tokenContract = new ethers.Contract(token, ABI, wssProvider);
    const amountIn = await tokenContract.balanceOf(walletAddress);
    const amountOut = await Contract.getAmountsOut(amountIn, sellPath);
    const buyAmount = parseInt(amountIn._hex) / 10 ** 18;
    const amountOutTx = parseInt(utils.formatUnits(amountOut[1]), 6);

    const amountOutMinTx = amountOutTx * ((100 - SLIPPAGE) / 100);
    const amountOutMin = ethers.utils.parseEther(amountOutMinTx.toString());

    console.log("\n\n\n ************** Get Amounts ***************\n");
    console.log("amountIn", buyAmount);
    console.log("amountOutMin", amountOutMinTx);
    console.log("\n\n\n *****************************\n");

    return { amountIn, amountOutMin, amountOutMinTx };
  } catch (error) {
    console.log("Error getting amounts out", error);
  }
};
