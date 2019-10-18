import * as bancorx from "../src";
import { split } from "eos-common";

const rawTrades = [
  [1.0, 100, 100, 0.99],
  [2.0, 101, 99, 1.92],
  [4.0, 103, 97, 3.63],
  // [16.0, 115, 87, 10.62],
  // [32.0, 131, 76, 14.99],
  // [64.0, 163, 61, 17.3],
  // [128.0, 227, 44, 15.88],
  // [256.0, 355, 28, 11.8],
  // [512.0, 611, 16, 7.46],
  // [1024.0, 1123, 9, 4.25],
  // [2048.0, 2147, 5, 2.27],
  // [4096.0, 4195, 2, 1.18]
];



const trades = rawTrades.map(([amount, bluBalance, redBalance, reward]) => ({
    amount: split(`${amount.toFixed(2)} BLU`),
    bluBalance: split(`${bluBalance.toFixed(2)} BLU`),
    redBalance: split(`${redBalance.toFixed(2)} RED`),
    reward: split(`${reward.toFixed(2)} RED`)
}))

test("bancorx.bancorFormula - EOS/BNT", () => {
  const balanceFrom = split(`77814.0638 EOS`); // EOS
  const balanceTo = split(`429519.5539120331 BNT`); // BNT
  const amount = split(`1.0000 EOS`);
  expect(bancorx.bancorFormula(balanceFrom, balanceTo, amount).toNumber()).toBe(
    5.519748143058556
  );

  trades.forEach(({ amount, bluBalance, redBalance, reward }) => {
    expect(
      bancorx.bancorFormula(bluBalance, redBalance, amount).toString()
    ).toEqual(reward.toString());
  });
});

test.skip("bancorx.bancorInverseFormula - EOS/BNT", () => {
  const balanceFrom = split(`77814.0638 EOS`);
  const balanceTo = split(`429519.5539120331 BNT`);
  const amountDesired = split(`1.0000000000 BNT`);
  expect(balanceFrom.symbol.precision).toBe(4);
  expect(balanceTo.symbol.precision).toBe(10);
  expect(amountDesired.symbol.precision).toBe(10);

  expect(
    bancorx
      .bancorInverseFormula(balanceFrom, balanceTo, amountDesired)
      .toNumber()
  ).toBe(0.1811657798);
});

test("bancorx.composeMemo", () => {
  const { CUSD, BNT } = bancorx.relays;
  const minReturn = "3.17";
  const destAccount = "<account>";
  const version = 1;

  // Single converter (BNT => CUSD)
  expect(bancorx.composeMemo([CUSD], minReturn, destAccount)).toBe(
    "1,bancorc11144 CUSD,3.17,<account>"
  );

  expect(bancorx.composeMemo([CUSD], minReturn, destAccount, version)).toBe(
    "1,bancorc11144 CUSD,3.17,<account>"
  );

  // Multi converter (EOS => BNT => CUSD)
  expect(
    bancorx.composeMemo([BNT, CUSD], minReturn, destAccount, version)
  ).toBe("1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>");
});

test("bancorx.parseBalance", () => {
  expect(bancorx.parseBalance("10.0000 EOS")).toEqual({
    quantity: 10.0,
    symbol: "EOS"
  });
  expect(bancorx.parseBalance(10.0)).toEqual({ quantity: 10.0 });
});
