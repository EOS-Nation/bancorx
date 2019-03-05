import * as bancorx from "..";

test("bancorx.bancorFormula - EOS/BNT", () => {
    const balance_from = 77814.0638; // EOS
    const balance_to = 429519.5539120331; // BNT
    const amount = 1;
    expect(bancorx.bancorFormula(balance_from, balance_to, amount)).toBe(5.519748143058556);
});

test("bancorx.bancorInverseFormula - EOS/BNT", () => {
    const balance_from = 77814.0638; // EOS
    const balance_to = 429519.5539120331; // BNT
    const amount_desired = 1;
    expect(bancorx.bancorInverseFormula(balance_from, balance_to, amount_desired)).toBe(0.18116577989712823);
});

test("bancorx.parseMemo", () => {
    const {CUSD, BNT} = bancorx.relays;
    const min_return = "3.17";
    const dest_account = "<account>";
    const version = 1;

    // Single converter (BNT => CUSD)
    expect(bancorx.parseMemo([CUSD], min_return, dest_account))
        .toBe("1,bancorc11144 CUSD,3.17,<account>");

    expect(bancorx.parseMemo([CUSD], min_return, dest_account, version))
        .toBe("1,bancorc11144 CUSD,3.17,<account>");

    // Multi converter (EOS => BNT => CUSD)
    expect(bancorx.parseMemo([BNT, CUSD], min_return, dest_account, version))
        .toBe("1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>");

});

test("bancorx.parseMemo", () => {
    expect(bancorx.parseBalance("10.0000 EOS")).toEqual({quantity: 10.0, symbol: "EOS"});
    expect(bancorx.parseBalance(10.0)).toEqual({quantity: 10.0});
});
