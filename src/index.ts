import { Converter, nRelay } from "./interfaces";
import { Asset, Symbol } from "eos-common";
export { relays } from "./Relays";
export { nRelay } from "./interfaces";
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
  const balanceFromNumber = balanceFrom.toDecimal();
  const balanceToNumber = balanceTo.toDecimal();
  const amountNumber = amountDesired.toDecimal();
  const oneNumber = new Decimal(1);

  const reward = balanceFromNumber
    .div(oneNumber.minus(amountNumber.div(balanceToNumber)))
    .minus(balanceFromNumber)
    .toFixed(0, Decimal.ROUND_UP);

  const formatted = new Decimal(
    Number(reward) * Math.pow(10, balanceTo.symbol.precision)
  ).toFixed(0, Decimal.ROUND_DOWN);

  return new Asset(Number(formatted), balanceFrom.symbol);
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
): string {
  const receiver = converters
    .map(({ account, symbol }) => {
      return `${account} ${symbol}`;
    })
    .join(" ");

  return `${version},${receiver},${minReturn},${destAccount}`;
}

export function relaysToConverters(
  from: Symbol,
  relays: nRelay[]
): Converter[] {
  return relays
    .map(relay =>
      relay.reserves.map(token => ({
        account: relay.contract,
        symbol: token.symbol.code()
      }))
    )
    .reduce((prev, curr) => prev.concat(curr))
    .filter(converter => converter.symbol !== from.code())
    .reduce((accum: Converter[], item: Converter) => {
      return accum.find(
        (converter: Converter) => converter.symbol == item.symbol
      )
        ? accum
        : [...accum, item];
    }, []);
}

export function removeRelay(
  relays: nRelay[],
  departingRelay: nRelay
): nRelay[] {
  return relays.filter(relay => {
    const [token1, token2] = relay.reserves;
    const [dToken1, dToken2] = departingRelay.reserves;
    return !(
      (token1.symbol.isEqual(dToken1.symbol) ||
        token1.symbol.isEqual(dToken2.symbol)) &&
      (token2.symbol.isEqual(dToken1.symbol) ||
        token2.symbol.isEqual(dToken2.symbol))
    );
  });
}

export function getOppositeSymbol(relay: nRelay, symbol: Symbol): Symbol {
  const oppositeToken = relay.reserves.find(
    token => !token.symbol.isEqual(symbol)
  )!!;
  return oppositeToken.symbol;
}

export function relayHasBothSymbols(symbol1: Symbol, symbol2: Symbol) {
  return function(relay: nRelay) {
    return relay.reserves.every(
      token => token.symbol.isEqual(symbol1) || token.symbol.isEqual(symbol2)
    );
  };
}

export function createPath(
  from: Symbol,
  to: Symbol,
  relays: nRelay[],
  path: nRelay[] = [],
  attempt: Symbol = from
): nRelay[] {
  const finalRelay = relays.find(relayHasBothSymbols(to, attempt));

  if (finalRelay) return [...path, finalRelay];

  const searchScope =
    path.length == 0 ? relays : removeRelay(relays, path[path.length - 1]);
  const firstRelayContainingAttempt = searchScope.find(relay =>
    relay.reserves.some(token => token.symbol.isEqual(attempt))
  );

  if (!firstRelayContainingAttempt)
    return createPath(from, to, searchScope, []);

  const oppositeSymbol = getOppositeSymbol(
    firstRelayContainingAttempt,
    attempt
  );
  return createPath(
    from,
    to,
    relays,
    [...path, firstRelayContainingAttempt],
    oppositeSymbol
  );
}
