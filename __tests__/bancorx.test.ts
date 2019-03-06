import * as bancorx from "..";

test("bancorx.bancorFormula - EOS/BNT", () => {
    const balanceFrom = 77814.0638; // EOS
    const balanceTo = 429519.5539120331; // BNT
    const amount = 1;
    expect(bancorx.bancorFormula(balanceFrom, balanceTo, amount)).toBe(5.519748143058556);
});

test("bancorx.bancorInverseFormula - EOS/BNT", () => {
    const balanceFrom = 77814.0638; // EOS
    const balanceTo = 429519.5539120331; // BNT
    const amountDesired = 1;
    expect(bancorx.bancorInverseFormula(balanceFrom, balanceTo, amountDesired)).toBe(0.18116577989712823);
});

test("bancorx.parseMemo", () => {
    const {CUSD, BNT} = bancorx.relays;
    const minReturn = "3.17";
    const destAccount = "<account>";
    const version = 1;

    // Single converter (BNT => CUSD)
    expect(bancorx.parseMemo([CUSD], minReturn, destAccount))
        .toBe("1,bancorc11144 CUSD,3.17,<account>");

    expect(bancorx.parseMemo([CUSD], minReturn, destAccount, version))
        .toBe("1,bancorc11144 CUSD,3.17,<account>");

    // Multi converter (EOS => BNT => CUSD)
    expect(bancorx.parseMemo([BNT, CUSD], minReturn, destAccount, version))
        .toBe("1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>");

});

test("bancorx.parseMemo", () => {
    expect(bancorx.parseBalance("10.0000 EOS")).toEqual({quantity: 10.0, symbol: "EOS"});
    expect(bancorx.parseBalance(10.0)).toEqual({quantity: 10.0});
});
