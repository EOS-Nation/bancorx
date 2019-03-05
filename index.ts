/**
 * Bancor Formula
 *
 * @example
 *
 * // token balance of EOS (eosio.token) in the relay: 77814.0638 EOS
 * // token balance of BNT (bntbntbntbnt) in the relay: 429519.5539120331 BNT
 * // The Formula:
 * // 10.0000 / (77814.0638 + 10.0000) * 429519.5539120331
 * // 55.19109809221157
 *
 * const source_balance = 77814.0638 // EOS
 * const target_balance = 429519.5539120331 // BNT
 * const source_amount = 10
 * bancorFormula(source_balance, target_balance, source_amount)
 * //=> 55.19109809221157
 */
export function bancorFormula(
    source_balance: number,
    target_balance: number,
    source_amount = 1,
) {
    return source_amount / (source_balance + source_amount) * target_balance;
}

/**
 * Parse Memo
 *
 * @example
 *
 * const memo = parseMemo("bnt2eoscnvrt BNT bancorc11144 CUSD", "3.17", "b1")
 * //=> "1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,b1"
 */
export function parseMemo(
    receiver: string,
    min_return: string,
    dest_account: string,
    version= 1,
) {
    return `${version},${receiver},${min_return},${dest_account}`;
}
/**
 * Parse Balance
 *
 * @private
 * @example
 *
 * parseBalance("10.0000 EOS") //=> {quantity: 10.0, symbol: "EOS"}
 * parseBalance(10.0) //=> {quantity: 10.0}
 */
export function parseBalance(balance: string | number) {
    if (typeof balance === "number") { return {quantity: balance}; }
    const [quantity, symbol] = balance.split(" ");
    return {quantity: Number(quantity), symbol};
}

export interface Relay {
    code: string;
    account: string;
    symbol: string;
    precision: number;
}

export interface Relays {
    EOS: Relay;
    BNT: Relay;
    ZOS: Relay;
    IQ: Relay;
    PGL: Relay;
    CUSD: Relay;
    DICE: Relay;
    BLACK: Relay;
    CET: Relay;
    EPRA: Relay;
    MEETONE: Relay;
    ZKS: Relay;
    OCT: Relay;
    KARMA: Relay;
    HVT: Relay;
    HORUS: Relay;
    MEV: Relay;
    [relay: string]: Relay;
}

export const relays: Relays = {
    EOS: {
        code: "eosio.token",
        account: "bnt2eoscnvrt",
        symbol: "EOS",
        precision: 4,
    },
    BNT: {
        code: "bntbntbntbnt",
        account: "bnt2eoscnvrt",
        symbol: "BNT",
        precision: 10,
    },
    ZOS: {
        code: "zosdiscounts",
        account: "bancorc11151",
        symbol: "ZOS",
        precision: 4,
    },
    IQ: {
        code: "everipediaiq",
        account: "bancorc11123",
        symbol: "IQ",
        precision: 3,
    },
    PGL: {
        code: "prospectorsg",
        account: "bancorc11113",
        symbol: "PGL",
        precision: 4,
    },
    CUSD: {
        code: "stablecarbon",
        account: "bancorc11144",
        symbol: "CUSD",
        precision: 2,
    },
    DICE: {
        code: "betdicetoken",
        account: "bancorc11125",
        symbol: "DICE",
        precision: 2,
    },
    BLACK: {
        code: "eosblackteam",
        account: "bancorc11111",
        symbol: "BLACK",
        precision: 4,
    },
    CET: {
        code: "eosiochaince",
        account: "bancorc11114",
        symbol: "CET",
        precision: 4,
    },
    EPRA: {
        code: "epraofficial",
        account: "bancorc11124",
        symbol: "EPRA",
        precision: 4,
    },
    MEETONE: {
        code: "eosiomeetone",
        account: "bancorc11122",
        symbol: "MEETONE",
        precision: 4,
    },
    ZKS: {
        code: "zkstokensr4u",
        account: "bancorc11142",
        symbol: "ZKS",
        precision: 0,
    },
    OCT: {
        code: "octtothemoon",
        account: "bancorc11132",
        symbol: "OCT",
        precision: 4,
    },
    KARMA: {
        code: "therealkarma",
        account: "bancorc11112",
        symbol: "KARMA",
        precision: 4,
    },
    HVT: {
        code: "hirevibeshvt",
        account: "bancorc11131",
        symbol: "HVT",
        precision: 4,
    },
    HORUS: {
        code: "horustokenio",
        account: "bancorc11121",
        symbol: "HORUS",
        precision: 4,
    },
    MEV: {
        code: "eosvegascoin",
        account: "bancorc11134",
        symbol: "MEV",
        precision: 4,
    },
};
