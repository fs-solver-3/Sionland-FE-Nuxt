import { BigNumber } from 'bignumber.js';

export const UI_GENERAL_TITLE = 'SION';
export const API_ENDPOINT = 'http://localhost:3000';
export const METAMASK_EXTENSION_URL = 'https://metamask.io/';

export const ETH_DECIMALS = 18;
export const RATE_TO_LAND = "2";

export const ZERO = new BigNumber(0);
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);

export const ONE_MINUTE_MS = 1000 * 60;
export const SECONDS_IN_A_DAY = new BigNumber(60 * 60 * 24);

export const GWEI_IN_WEI = new BigNumber(1000000000);
export const DEFAULT_GAS_PRICE = GWEI_IN_WEI.multipliedBy(6);

//------------------------ADDRESS--------------------------------//

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const SIONTOKEN_CONTRACT = '0x364Dd53daC7f3F9dAC00C0609311Ca8c1B2258e5';
export const SIONLAND_CONTRACT = '0x683D872e44A31f3d25082222D43e8213A2602613';
export const MARKET_PLACE_CONTRACT = '0x0b29dCd42D9a207e7478d1902658fa0972A0496b';
export const OWNER_ADDRESS = '0x390A0815e69F068C7859A9fF07A01aC54A2a9968';