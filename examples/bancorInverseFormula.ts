import * as bancorx from "../";

const balanceFrom = 77814.0638; // EOS
const balanceTo = 429519.5539120331; // BNT
const amountDesired = 1;
bancorx.bancorInverseFormula(balanceFrom, balanceTo, amountDesired);
// => 0.18116577989712823
