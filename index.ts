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
 * @param {number} balanceFrom from token balance in the relay
 * @param {number} balanceTo to token balance in the relay
 * @param {number} amount amount to convert
 * @returns {number} computed amount
 * @example
 *
 * const balanceFrom = 77814.0638 // EOS
 * const balanceTo = 429519.5539120331 // BNT
 * const amount = 1
 *
 * bancorx.bancorFormula(balanceFrom, balanceTo, amount)
 * // => 5.519748143058556
 */
export function bancorFormula(
    balanceFrom: number,
    balanceTo: number,
    amount: number,
) {
    return amount / (balanceFrom + amount) * balanceTo;
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
 * @param {number} balanceFrom from token balance in the relay
 * @param {number} balanceTo to token balance in the relay
 * @param {number} amountDesired amount to desired
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
    balanceFrom: number,
    balanceTo: number,
    amountDesired: number,
) {
    return balanceFrom / (1.0 - amountDesired / balanceTo) - balanceFrom;
}

/**
 * Parse Memo
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
 * bancorx.parseMemo([CUSD], "3.17", "<account>")
 * // => "1,bancorc11144 CUSD,3.17,<account>"
 *
 * // Multi converter (EOS => BNT => CUSD)
 * bancorx.parseMemo([BNT, CUSD], "3.17", "<account>")
 * // => "1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>"
 */
export function parseMemo(
    converters: Converter[],
    minReturn: string,
    destAccount: string,
    version= 1,
) {
    const receiver = converters.map(({account, symbol}) => {
        return `${account} ${symbol}`;
    }).join(" ");

    return `${version},${receiver},${minReturn},${destAccount}`;
}

/**
 * Parse Balance
 *
 * @param {string|number} balance token balance
 * @returns {Object} parsed balance
 * @example
 *
 * bancorx.parseBalance("10.0000 EOS") // => {quantity: 10.0, symbol: "EOS"}
 * bancorx.parseBalance(10.0) // => {quantity: 10.0}
 */
export function parseBalance(balance: string | number) {
    if (typeof balance === "number") { return {quantity: balance}; }
    const [quantity, symbol] = balance.split(" ");
    return {quantity: Number(quantity), symbol};
}

/**
 * Relays
 *
 * @example
 *
 * bancorx.relays.BNT
 * // => { code: "bntbntbntbnt", account: "bnt2eoscnvrt", symbol: "BNT", precision: 10 }
 *
 * bancorx.relays.CUSD
 * // => { code: "stablecarbon", account: "bancorc11144", symbol: "CUSD", precision: 2 }
 *
 */
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

export interface Converter {
    account: string;
    symbol: string;
}
