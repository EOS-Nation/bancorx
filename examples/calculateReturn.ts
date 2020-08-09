import * as bancorx from "..";
import { asset } from "eos-common";

const decmialFee = 0.002;
const balanceFrom = asset('2300771.8177 VIG');
const balanceTo = asset('6399.7216425395 BNT');
const amount = asset('100.0000 VIG');
const result = bancorx.calculateReturn(balanceFrom, balanceTo, amount);
// => Asset type of 0.2781433365 BNT
console.log(result.reward.toString());

const magnitude = 2;
const resultFee = bancorx.chargeFee(result.reward, decmialFee, magnitude);
// => Asset type of 0.2770318757 BNT
console.log(resultFee.toString());
