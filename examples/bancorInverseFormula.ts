import * as bancorx from "../src";
import { split } from "eos-common";

const balanceFrom = split("77814.0638 EOS"); // EOS
const balanceTo = split("429519.5539120331 BNT"); // BNT
const amountDesired = split("1.0000000000 BNT");
bancorx.bancorInverseFormula(balanceFrom, balanceTo, amountDesired);
// => Asset type of 0.18116577989712823 BNT
