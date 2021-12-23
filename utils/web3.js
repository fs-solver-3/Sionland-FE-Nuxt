import Web3 from "web3";
import { BigNumber } from "bignumber.js";
import SionToken from "../contracts/siontoken-abi.json";
import SionLand from "../contracts/sionland-abi.json";
import MarketPlace from "../contracts/marketplace-abi.json";

import {
    SIONTOKEN_CONTRACT,
    SIONLAND_CONTRACT,
    MARKET_PLACE_CONTRACT,
    OWNER_ADDRESS,
    RATE_TO_LAND,
    ETH_DECIMALS,
} from "../secret";

export const buyLandsRequest = async(address, buyLandsIds) => {
    const web3 = new Web3(window.web3.currentProvider);
    const sionTokenContract = new web3.eth.Contract(
        SionToken.abi,
        SIONTOKEN_CONTRACT
    );
    const marketPlaceContract = new web3.eth.Contract(
        MarketPlace.abi,
        MARKET_PLACE_CONTRACT
    );
    // const rateToken = unitsInTokenAmount(RATE_TO_LAND, ETH_DECIMALS);
    // const amountLands = buyLandsIds.length;
    // const amoutToken = rateToken.multipliedBy(amountLands);
    const rateToken = web3.utils.toWei(RATE_TO_LAND, "ether");
    const amountLands = buyLandsIds.length;
    const amoutToken = rateToken * amountLands;
    console.log(amoutToken);
    console.log(buyLandsIds);
    console.log(amountLands);

    try {
        await sionTokenContract.methods
            .approve(MARKET_PLACE_CONTRACT, amoutToken.toString())
            .send({
                from: address,
            });
        const allowanceSize = await sionTokenContract.methods
            .allowance(address, MARKET_PLACE_CONTRACT)
            .call();
        console.log("allowanceSize is ", allowanceSize);
        if (allowanceSize >= amoutToken) {
            await marketPlaceContract.methods
                .buyLands(OWNER_ADDRESS, rateToken, buyLandsIds)
                .send({
                    from: address,
                });
            alert("Land(s) Purcharsed");
        } else {
            alert("insufficiant allowance");
        }
    } catch (e) {
        alert("error on buyLands");
        console.log(e);
    }
};
export const marketPlaceEvents = async() => {
    const web3 = new Web3(window.web3.currentProvider);
    const marketPlaceContract = new web3.eth.Contract(
        MarketPlace.abi,
        MARKET_PLACE_CONTRACT
    );
    let transactionId = "";
    marketPlaceContract.events
        .allEvents()
        .on("data", function(event) {
            if (transactionId != event.id && event.event == "BuyLandsFinished") {
                console.log("buyFinished");
            }
        })
        .on("BuyLandsFinished", function(event) {
            console.log("buyFinished");
        })
        .on("error", console.error);
};
export const sionTokenEvents = async() => {
    const web3 = new Web3(window.web3.currentProvider);
    const sionTokenContract = new web3.eth.Contract(
        SionToken.abi,
        SIONTOKEN_CONTRACT
    );
    let transactionId = "";
    sionTokenContract.events
        .allEvents()
        .on("data", function(event) {
            if (transactionId != event.id && event.event == "Approval") {
                console.log("Approval Finished");
            }
        })
        .on("Approval", function(event) {
            console.log("Approval Finished");
        })
        .on("error", console.error);
};
export const getLandsBatch = async(address) => {
    const web3 = new Web3(window.web3.currentProvider);
    const sionLandContract = new web3.eth.Contract(
        SionLand.abi,
        SIONLAND_CONTRACT
    );
    const amountLists = await sionLandContract.methods.balanceOf(address).call();
    if (amountLists != 0) {
        try {
            const landsList = await sionLandContract.methods
                .getLandsBatch(address)
                .call();
            return landsList;
        } catch (e) {
            console.log(e.message);
            console.log("error on getLandsBatch", e);
        }
    }
    const initLand = [];
    return initLand;
};
export const getBalance = async(address) => {
    const web3 = new Web3(window.web3.currentProvider);
    const sionTokenContract = new web3.eth.Contract(
        SionToken.abi,
        SIONTOKEN_CONTRACT
    );
    try {
        const balance1 = await sionTokenContract.methods.balanceOf(address).call();
        const amontBalance = Number(web3.utils.fromWei(balance1, 'ether')).toFixed(3);
        console.log(balance1);
        console.log(amontBalance);
        return amontBalance;
    } catch (e) {
        console.log("error on getBalance", e);
    }
};
export const tokenAmountInUnitsToBigNumber = (amount, decimals) => {
    const decimalsPerToken = new BigNumber(10).pow(decimals);
    return amount.div(decimalsPerToken);
};
export const tokenAmountInUnits = (amount, decimals, toFixedDecimals = 3) => {
    return tokenAmountInUnitsToBigNumber(amount, decimals).toFixed(
        toFixedDecimals
    );
};

export const unitsInTokenAmount = (units, decimals) => {
    const decimalsPerToken = new BigNumber(10).pow(decimals);

    return new BigNumber(units).multipliedBy(decimalsPerToken);
};