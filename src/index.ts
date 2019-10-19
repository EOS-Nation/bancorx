import { Converter } from "./interfaces";
import { Asset, Symbol } from "eos-common";
export { relays } from "./Relays";
import Decimal from "decimal.js";

/**
 * Bancor Formula
 *
 * - token balance of EOS (eosio.token) in the relay: 77814.0638 EOS
 * - token balance of BNT (bntbntbntbnt) in the relay: 429519.5539120331 BNT
 *
 * ```js
 * Formula:
 * 1.0000 / (77814.0638 + 1.0000) * 429519.5539120331
 * // => 5.519748143058556
 * ```
 *
 * @param {Asset} balanceFrom from token balance in the relay
 * @param {Asset} balanceTo to token balance in the relay
 * @param {Asset} amount amount to convert
 * @returns {number} computed amount
 * @example
 *
 * const balanceFrom = split(`77814.0638 EOS`);
 * const balanceTo = split(`429519.5539120331 BNT`); // BNT
 * const amount = split(`1.0000 EOS`);
 *
 * bancorx.bancorFormula(balanceFrom, balanceTo, amount)
 * // => split(`5.519748143058556 BNT`)
 */
export function bancorFormula(
  balanceFrom: Asset,
  balanceTo: Asset,
  amount: Asset
) {
  if (!balanceFrom.symbol.isEqual(amount.symbol))
    throw new Error("From symbol does not match amount symbol");
  const balanceFromNumber = balanceFrom.toDecimal();
  const balanceToNumber = balanceTo.toDecimal();
  const amountNumber = amount.toDecimal();

  const reward = amountNumber
    .div(balanceFromNumber.plus(amountNumber))
    .times(balanceToNumber)
    .toFixed(balanceTo.symbol.precision, Decimal.ROUND_DOWN);

  const formatted = new Decimal(
    Number(reward) * Math.pow(10, balanceTo.symbol.precision)
  ).toFixed(0, Decimal.ROUND_DOWN);

  return new Asset(Number(formatted), balanceTo.symbol);
}

/**
 * Bancor Inverse Formula
 *
 * - token balance of EOS (eosio.token) in the relay: 77814.0638 EOS
 * - token balance of BNT (bntbntbntbnt) in the relay: 429519.5539120331 BNT
 *
 * ```js
 * Inverse Formula:
 * 77814.0638 / (1.0 - 1 / 429519.5539120331) - 77814.0638
 * // => 0.18116577989712823
 * ```
 *
 * @param {Asset} balanceFrom from token balance in the relay
 * @param {Asset} balanceTo to token balance in the relay
 * @param {Asset} amountDesired amount to desired
 * @returns {number} computed desired amount
 * @example
 *
 * const balanceFrom = 77814.0638 // EOS
 * const balanceTo = 429519.5539120331 // BNT
 * const amountDesired = 1
 *
 * bancorx.bancorInverseFormula(balanceFrom, balanceTo, amountDesired)
 * // => 0.18116577989712823
 */
export function bancorInverseFormula(
  balanceFrom: Asset,
  balanceTo: Asset,
  amountDesired: Asset
) {
  if (!balanceTo.symbol.isEqual(amountDesired.symbol))
    throw new Error("From symbol does not match amount symbol");
  const reward =
    balanceFrom.amount / (1.0 - amountDesired.amount / balanceTo.amount) -
    balanceFrom.amount;
  return new Asset(reward, amountDesired.symbol);
}

/**
 * Compose Memo
 *
 * @param {Converter[]} converters relay converters
 * @param {number} minReturn minimum return
 * @param {string} destAccount destination acccount
 * @param {number} [version=1] bancor protocol version
 * @returns {string} computed memo
 * @example
 *
 * const CUSD = bancorx.relays.CUSD;
 * const BNT = bancorx.relays.BNT;
 *
 * // Single converter (BNT => CUSD)
 * bancorx.composeMemo([CUSD], "3.17", "<account>")
 * // => "1,bancorc11144 CUSD,3.17,<account>"
 *
 * // Multi converter (EOS => BNT => CUSD)
 * bancorx.composeMemo([BNT, CUSD], "3.17", "<account>")
 * // => "1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>"
 */
export function composeMemo(
  converters: Converter[],
  minReturn: string,
  destAccount: string,
  version = 1
) {
  const receiver = converters
    .map(({ account, symbol }) => {
      return `${account} ${symbol}`;
    })
    .join(" ");

  return `${version},${receiver},${minReturn},${destAccount}`;
}

/**
 * Parse Balance
 *
 * @param {string|number} balance token balance
 * @returns {Object} parsed balance
 * @example
 *
 * bancorx.parseBalance("10.0000 EOS") // => {quantity: 10.0, symbol: "EOS"}
 * bancorx.parseBalance(10.0) // => {quantity: 10.0}
 */
export function parseBalance(balance: string | number) {
  if (typeof balance === "number") {
    return { quantity: balance };
  }
  const [quantity, symbol] = balance.split(" ");
  return { quantity: Number(quantity), symbol };
}
