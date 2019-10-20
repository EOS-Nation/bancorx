import * as bancorx from "../src";
import { split } from "eos-common";

const balanceFrom = split(`77814.0638 EOS`);
const balanceTo = split(`429519.5539120331 BNT`);
const amount = split(`1.0000 EOS`);
bancorx.bancorFormula(balanceFrom, balanceTo, amount);
// => Asset type of 5.519748143058556 BNT
