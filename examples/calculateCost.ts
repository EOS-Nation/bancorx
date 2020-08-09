import * as bancorx from "..";
import { asset } from "eos-common";

const balanceFrom = asset("77814.0638 EOS"); // EOS
const balanceTo = asset("429519.5539120331 BNT"); // BNT
const amountDesired = asset("1.0000000000 BNT");
const costs = bancorx.calculateCost(balanceFrom, balanceTo, amountDesired);
// => Asset type of 0.18116577989712823 BNT
console.log(costs.reward.to_string())
