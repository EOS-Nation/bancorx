import * as bancorx from "..";

test("bancorx.relays - CUSD", () => {
    expect(bancorx.relays.CUSD).toBe({ code: "stablecarbon", account: "bancorc11144", symbol: "CUSD", precision: 2 });
});
