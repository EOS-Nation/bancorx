import * as bancorx from "..";
import { asset } from "eos-common";

const balanceFrom = asset(`6402.0273238755 BNT`);
const balanceTo = asset(`2299947.3063 VIG`);
const amount = asset(`1.0000000000 BNT`);
const result = bancorx.calculateReturn(balanceFrom, balanceTo, amount);
// => Asset type of 359.1968 VIG
console.log(result.reward.toString());

const fee = bancorx.chargeFee(result.reward, 0.002, 2);
// => Asset type of 357.7614 VIG
console.log(fee.toString());
