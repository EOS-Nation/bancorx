import * as bancorx from "../src";

const balanceFrom = 77814.0638; // EOS
const balanceTo = 429519.5539120331; // BNT
const amount = 1;
bancorx.bancorFormula(balanceFrom, balanceTo, amount);
// => 5.519748143058556
