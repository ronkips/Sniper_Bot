import { ethers } from "ethers";
import {
  buyAmount,
  config,
  fallBackGasLimit,
  wssProvider
} from "../Config/config";
import { Overloads, txContents } from "../contents/interface";
import ABI from "../utils/contract-abi.json";
import { buyToken } from "../uniSwap/buy";
import { buyApprove } from "../uniSwap/approve";

const methodsExcluded = ["0x0", "0x"];
let tokensToMonitor: any = config.TOKEN_TO_MONITOR;

//decode the txContents.data to get the method name
const abiIn = new ethers.utils.Interface(ABI);

export const dataProcessing = async (txContents: txContents) => {
  //exclude transfer method
  if (!methodsExcluded.includes(txContents.data)) {
    //compare transaction router to unuswap router address
    let routerAddress = txContents.to?.toLocaleLowerCase();
    // console.log("fount it ", routerAddress);
    if (routerAddress == config.UNISWAP_ROUTER) {
      // console.log("Transaction to uniswap router started");
      // console.log("txContents:", txContents.data);

      const decodedData = abiIn.parseTransaction({ data: txContents.data });

      const value = ethers.utils.parseUnits(buyAmount.toString(), "ether");

      let gasPrice = parseInt(txContents.gasPrice?._hex!, 16);
      let maxFeePerGas: number | undefined;
      let maxPriorityFeePerGas: number | undefined;
      let overloads: Overloads;
      if (txContents.maxFeePerGas && txContents.maxPriorityFeePerGas) {
        maxFeePerGas = parseInt(txContents.maxFeePerGas._hex!, 16);
        maxPriorityFeePerGas = parseInt(
          txContents.maxPriorityFeePerGas._hex!,
          16
        );
      }
      // console.log("Thiis is our overloads:", overLoads);
      const nonce = await wssProvider.getTransactionCount(
        process.env.WALLET_ADDRESS!
      );
      if (isNaN(maxFeePerGas!)) {
        overloads = {
          gasPrice,
          gasLimit: fallBackGasLimit,
          nonce: nonce,
          value: value
        };
      } else {
        overloads = {
          gasLimit: fallBackGasLimit,
          nonce: nonce,
          maxFeePerGas,
          maxPriorityFeePerGas,
          value: value
        };
      }

      let methodName = decodedData.name;

      // Filter the addLiquidity method
      if (methodName == "addLiquidity") {
        let token;
        let tokenA = decodedData.args.tokenA.toLocaleLowerCase();
        let tokenB = decodedData.args.tokenB.toLocaleLowerCase();
        console.log(`TokenA: ${tokenA}, TokenB: ${tokenB}`);

        if (tokenA === tokensToMonitor[0]) {
          token = tokenA;
        } else if (tokenB == tokensToMonitor[0]) {
          token = tokenB;
        }
        if (token) {
          let buyPath = [token, config.WETH_ADDRESS];

          if (buyPath) {
            const buyTxData = await buyToken(buyPath, overloads);
            console.log("Successs our buyTxData is", buyTxData);
          }
        }
      } else if (methodName == "addLiquidityETH") {
        let token = decodedData.args.token.toLocaleLowerCase();
        console.log("\n Our token is==:", token);

        if (token) {
          let buyPath = [config.WETH_ADDRESS, token];

          if (buyPath) {
            const buyTxData = await buyToken(buyPath, overloads);
            console.log("Successs our buyTxData is=:", buyTxData);
            // Check if rabnsaction is true
            if (buyTxData.success === true) {
              await buyApprove(token, overloads);

            }
          }
        }
        // for (let i = 0; i < tokensToMonitor?.length; i++) {
        //   let tokenToMonitor = tokensToMonitor[i].toLowerCase();
        //   //   console.log("TokenToMonitor:", tokenToMonitor);

        //   if (tokenToMonitor.includes(token)) {
        //     console.log("Found the token ", token);
        //     //   let path = [config.WETH_ADDRESS, token];
        //   }
        // }
      }
    }
  }
};
