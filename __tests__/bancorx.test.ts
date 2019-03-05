import * as bancorx from "..";

test("bancorx.bancorFormula - EOS/BNT", () => {
    const source_balance = 77814.0638; // EOS
    const target_balance = 429519.5539120331; // BNT
    const source_amount = 10;
    expect(bancorx.bancorFormula(source_balance, target_balance, source_amount)).toBe(55.19109809221157);
});

test("bancorx.bancorFormula - BNT/CUSD", () => {
    const source_balance = 47640.4219010498; // BNT
    const target_balance = 24267.97; // CUSD
    expect(bancorx.bancorFormula(source_balance, target_balance)).toBe(0.5093880289804122);
});

test("bancorx.parseMemo", () => {
    const receiver = "bnt2eoscnvrt BNT bancorc11144 CUSD";
    const min_return = "3.17";
    const dest_account = "b1";
    const version = 1;
    expect(bancorx.parseMemo(receiver, min_return, dest_account))
        .toBe("1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,b1");

    expect(bancorx.parseMemo(receiver, min_return, dest_account, version))
        .toBe("1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,b1");
});

test("bancorx.parseMemo", () => {
    expect(bancorx.parseBalance("10.0000 EOS")).toEqual({quantity: 10.0, symbol: "EOS"});
    expect(bancorx.parseBalance(10.0)).toEqual({quantity: 10.0});
});
