import { Converter } from "./interfaces";
export { relays } from "./relays";

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
 * @param {number} balanceFrom from token balance in the relay
 * @param {number} balanceTo to token balance in the relay
 * @param {number} amount amount to convert
 * @returns {number} computed amount
 * @example
 *
 * const balanceFrom = 77814.0638 // EOS
 * const balanceTo = 429519.5539120331 // BNT
 * const amount = 1
 *
 * bancorx.bancorFormula(balanceFrom, balanceTo, amount)
 * // => 5.519748143058556
 */
export function bancorFormula(
  balanceFrom: number,
  balanceTo: number,
  amount: number
) {
  return (amount / (balanceFrom + amount)) * balanceTo;
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
 * @param {number} balanceFrom from token balance in the relay
 * @param {number} balanceTo to token balance in the relay
 * @param {number} amountDesired amount to desired
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
  balanceFrom: number,
  balanceTo: number,
  amountDesired: number
) {
  return balanceFrom / (1.0 - amountDesired / balanceTo) - balanceFrom;
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
