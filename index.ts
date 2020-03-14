import { Asset, ExtendedSymbol, SymbolCode, Name } from "eos-common";
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
  if (amount.amount >= balanceFrom.amount)
    throw new Error("Impossible to buy the entire reserve or more");

  Decimal.set({ precision: 15, rounding: Decimal.ROUND_DOWN });
  const balanceFromNumber = new Decimal(Number(balanceFrom.amount));
  const balanceToNumber = new Decimal(Number(balanceTo.amount));
  const amountNumber = new Decimal(Number(amount.amount));

  const reward = amountNumber
    .div(balanceFromNumber.plus(amountNumber))
    .times(balanceToNumber);

  return new Asset(
    reward
      .times(Math.pow(10, balanceTo.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .toNumber(),
    balanceTo.symbol
  );
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
  const balanceFromNumber = new Decimal(Number(balanceFrom.amount));
  const balanceToNumber = new Decimal(Number(balanceTo.amount));
  const amountNumber = new Decimal(Number(amountDesired.amount));
  const oneNumber = new Decimal(1);

  Decimal.set({ precision: 15, rounding: Decimal.ROUND_UP });
  const reward = balanceFromNumber
    .div(oneNumber.minus(amountNumber.div(balanceToNumber)))
    .minus(balanceFromNumber);

  return new Asset(
    reward
      .times(Math.pow(10, balanceFrom.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
      .toNumber(),
    balanceFrom.symbol
  );
}

export function calculateReserveToSmart(
  reserveAmount: Asset,
  reserveBalance: Asset,
  smartSupply: Asset,
  ratio: number = 0.5
): Asset {
  const smartSupplyN = new Decimal(Number(smartSupply.amount)).times(-1);
  const balanceN = new Decimal(Number(reserveBalance.amount));
  const depositAmountN = new Decimal(Number(reserveAmount.amount));
  const one = new Decimal(1);

  Decimal.set({ precision: 15, rounding: Decimal.ROUND_DOWN });
  const reward = smartSupplyN.times(
    one.minus(one.plus(depositAmountN.div(balanceN)).pow(ratio))
  );
  return new Asset(
    reward
      .times(Math.pow(10, smartSupply.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
      .toNumber(),
    smartSupply.symbol
  );
}

export function calculateSmartToReserve(
  smartTokens: Asset,
  reserveBalance: Asset,
  smartSupply: Asset,
  ratio: number = 0.5
): Asset {
  const reserveTokensN = new Decimal(Number(smartTokens.amount));
  const reserveBalanceN = new Decimal(Number(reserveBalance.amount));
  const smartSupplyN = new Decimal(Number(smartSupply.amount));
  const one = new Decimal(1);
  const ratioN = one.div(new Decimal(ratio));

  Decimal.set({ precision: 15, rounding: Decimal.ROUND_DOWN });

  const reward = reserveBalanceN.times(
    one.minus(Decimal.pow(one.minus(reserveTokensN.div(smartSupplyN)), ratioN))
  );

  return new Asset(
    reward
      .times(Math.pow(10, reserveBalance.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
      .toNumber(),
    reserveBalance.symbol
  );
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
  converters: { contract: Name; symcode: SymbolCode; extsym?: ExtendedSymbol; }[],
  minReturn: string,
  destAccount: string,
  version = 1
): string {
  const receiver = converters
    .map(({ extsym, symcode, contract }) => {
      if ( extsym ) return `${ extsym.get_contract().to_string() }:${ extsym.get_symbol().code().to_string() } ${ symcode.to_string() }`
      return `${ contract.to_string() } ${symcode.to_string() }`;
    })
    .join(" ");

  return `${version},${receiver},${minReturn},${destAccount}`;
}

export function chargeFee(
  asset: Asset,
  decimalFee: number,
  magnitude: number = 1
): Asset {
  Decimal.set({ precision: 15, rounding: Decimal.ROUND_DOWN });
  const assetAmount = new Decimal(Number(asset.amount));
  const one = new Decimal(1);
  const totalFee = assetAmount.times(
    one.minus(Decimal.pow(one.minus(decimalFee), magnitude))
  );
  const newAmount = assetAmount.minus(totalFee);
  return new Asset(
    newAmount
      .times(Math.pow(10, asset.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
      .toNumber(),
    asset.symbol
  );
}

export function liquidate(
  smartTokens: Asset,
  reserveBalance: Asset,
  smartSupply: Asset
) {
  const smartTokensN = new Decimal(Number(smartTokens.amount));
  const reserveBalanceN = new Decimal(Number(reserveBalance.amount));
  const smartSupplyN = new Decimal(Number(smartSupply.amount));

  const reward = smartTokensN.times(reserveBalanceN).div(smartSupplyN);
  return new Asset(
    reward
      .times(Math.pow(10, reserveBalance.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .toNumber(),
    reserveBalance.symbol
  );
}

export function calculateLiquidateCost(
  reserveTokens: Asset,
  reserveBalance: Asset,
  smartSupply: Asset
) {
  const reserveTokensN = new Decimal(Number(reserveTokens.amount));
  const reserveBalanceN = new Decimal(Number(reserveBalance.amount));
  const smartSupplyN = new Decimal(Number(smartSupply.amount));

  const reward = reserveTokensN.times(smartSupplyN).div(reserveBalanceN);
  return new Asset(
    reward
      .times(Math.pow(10, smartSupply.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .toNumber(),
    smartSupply.symbol
  );
}

const bigNumber = Decimal.pow(10, 10);

export function fund(
  smartTokens: Asset,
  reserveBalance: Asset,
  smartSupply: Asset
) {
  Decimal.set({ precision: 15, rounding: Decimal.ROUND_DOWN });
  const smartTokensN = new Decimal(Number(smartTokens.amount));
  const reserveBalanceN = new Decimal(Number(reserveBalance.amount));
  const smartSupplyN = new Decimal(Number(smartSupply.amount));

  const cost = smartTokensN.div(smartSupplyN).times(reserveBalanceN);

  return new Asset(
    cost
      .times(Math.pow(10, reserveBalance.symbol.precision()))
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .toNumber(),
    reserveBalance.symbol
  );
}

export function calculateFundReturn(
  reserveTokens: Asset,
  reserveBalance: Asset,
  smartSupply: Asset
) {
  Decimal.set({ precision: 15, rounding: Decimal.ROUND_DOWN });
  const reserveTokensN = new Decimal(Number(reserveTokens.amount)).times(bigNumber);
  const reserveBalanceN = new Decimal(Number(reserveBalance.amount)).times(bigNumber);
  const smartSupplyN = new Decimal(Number(smartSupply.amount)).times(bigNumber);
  const one = new Decimal(1);

  // y(s+1) + 1 / r

  const reward = reserveTokensN
    .times(smartSupplyN.plus(one))
    .plus(one)
    .div(reserveBalanceN);

  return new Asset(
    reward
      .times(Math.pow(10, smartSupply.symbol.precision()))
      .div(bigNumber)
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .toNumber(),
    smartSupply.symbol
  );
}
