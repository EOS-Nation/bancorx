import { Converter, nRelay, TokenSymbol, ChoppedRelay } from "./interfaces";
import { Asset, Symbol } from "eos-common";
export { relays } from "./Relays";
export * from "./interfaces";
export { AbstractBancorCalculator } from "./AbstractBancorCalculator";
import Decimal from "decimal.js";
import _ from "underscore";

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
 * bancorx.calculateReturn(balanceFrom, balanceTo, amount)
 * // => split(`5.519748143058556 BNT`)
 */
export function calculateReturn(
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
 * bancorx.calculateCost(balanceFrom, balanceTo, amountDesired)
 * // => 0.18116577989712823
 */
export function calculateCost(
  balanceFrom: Asset,
  balanceTo: Asset,
  amountDesired: Asset
) {
  if (!balanceTo.symbol.isEqual(amountDesired.symbol))
    throw new Error("From symbol does not match amount symbol");
  if (amountDesired.amount >= balanceTo.amount)
    throw new Error("Impossible to buy the entire reserve or more");
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
    .map(({ account, symbol, multiContractSymbol }) => {
      return `${account}${
        multiContractSymbol ? `:${multiContractSymbol}` : ""
      } ${symbol}`;
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
      relay.reserves.map(token => {
        const base = {
          account: relay.contract,
          symbol: token.symbol.code()
        };
        return relay.isMultiContract
          ? { ...base, multiContractSymbol: relay.smartToken.symbol.code() }
          : base;
      })
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

export function removeChoppedRelay(
  relays: ChoppedRelay[],
  departingRelay: ChoppedRelay
): ChoppedRelay[] {
  return relays.filter(relay => !_.isEqual(relay, departingRelay));
}

export function getOppositeSymbol(relay: ChoppedRelay, symbol: Symbol): Symbol {
  const oppositeToken = relay.reserves.find(
    token => !token.symbol.isEqual(symbol)
  )!!;
  return oppositeToken.symbol;
}

export function relayHasBothSymbols(
  symbol1: Symbol,
  symbol2: Symbol
): (choppedRelay: ChoppedRelay) => boolean {
  return function(relay: ChoppedRelay) {
    return relay.reserves.every(
      token => token.symbol.isEqual(symbol1) || token.symbol.isEqual(symbol2)
    );
  };
}

export const chopRelay = (item: nRelay): ChoppedRelay[] => {
  return [
    {
      contract: item.contract,
      reserves: [item.reserves[0], item.smartToken]
    },
    {
      contract: item.contract,
      reserves: [item.reserves[1], item.smartToken]
    }
  ];
};

export const chopRelays = (relays: nRelay[]) => {
  return relays.reduce((accum: ChoppedRelay[], item: nRelay) => {
    const [relay1, relay2] = chopRelay(item);
    return [...accum, relay1, relay2];
  }, []);
};

export function findPath(
  from: Symbol,
  to: Symbol,
  relays: ChoppedRelay[],
  path: ChoppedRelay[] = [],
  attempt: Symbol = from
): ChoppedRelay[] {
  const finalRelay = relays.find(relayHasBothSymbols(to, attempt));

  if (finalRelay) return [...path, finalRelay];

  const searchScope =
    path.length == 0
      ? relays
      : removeChoppedRelay(relays, path[path.length - 1]);
  const firstRelayContainingAttempt = searchScope.find((relay: ChoppedRelay) =>
    relay.reserves.some(token => token.symbol.isEqual(attempt))
  )!;

  if (!firstRelayContainingAttempt) return findPath(from, to, searchScope, []);

  const oppositeSymbol = getOppositeSymbol(
    firstRelayContainingAttempt,
    attempt
  );
  return findPath(
    from,
    to,
    relays,
    [...path, firstRelayContainingAttempt],
    oppositeSymbol
  );
}

function relayOffersSymbols(symbol1: Symbol, symbol2: Symbol) {
  return function(relay: nRelay) {
    const inReserves = relay.reserves.every(
      token => token.symbol.isEqual(symbol1) || token.symbol.isEqual(symbol2)
    );
    if (inReserves) return inReserves;
    const inReserve = relay.reserves.some(
      token => token.symbol.isEqual(symbol1) || token.symbol.isEqual(symbol2)
    );
    const inSmartToken =
      relay.smartToken.symbol.isEqual(symbol1) ||
      relay.smartToken.symbol.isEqual(symbol2);
    return inReserve && inSmartToken;
  };
}

// Opposite of unChopRelays
export function unChopRelays(choppedRelays: ChoppedRelay[], relays: nRelay[]) {
  return choppedRelays.reduce((accum: nRelay[], choppedRelay: ChoppedRelay) => {
    const relayOfInterest = relayOffersSymbols(
      choppedRelay.reserves[0].symbol,
      choppedRelay.reserves[1].symbol
    );
    const alreadyExistingRelay = accum.find(relayOfInterest);
    return alreadyExistingRelay
      ? accum
      : [...accum, relays.find(relayOfInterest)!];
  }, []);
}

export function createPath(
  from: Symbol,
  to: Symbol,
  relays: nRelay[]
): nRelay[] {
  const choppedRelays = chopRelays(relays);
  const choppedRelaysPath: ChoppedRelay[] = findPath(from, to, choppedRelays);
  const wholeRelaysPath: nRelay[] = unChopRelays(
    choppedRelaysPath,
    relays
  ) as nRelay[];
  return wholeRelaysPath;
}
