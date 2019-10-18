import * as bancorx from "../src";
import { split } from "eos-common";
import { trades } from "./trades";

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
