# BancorX utility

> Collection of useful Javascript (Typescript) methods used for [BancorX](https://eos.bancor.network).

## Install

Using Yarn:

```bash
yarn add bancorx
```

or using NPM:

```bash
npm install --save bancorx
```

## Import Module

**CommonJS**

```js
const bancorx = require("bancorx");
```

**Typescript (ES6)**

```js
import * as bancorx from "bancorx";
```

## BancorX Formula

- token balance of EOS (`eosio.token`) in the relay: `77814.0638 EOS`
- token balance of BNT (`bntbntbntbnt`) in the relay: `429519.5539120331 BNT`

**The Formula:**

```js
10.0000 / (77814.0638 + 10.0000) * 429519.5539120331
55.19109809221157
```

```js
const source_balance = 77814.0638 // EOS
const target_balance = 429519.5539120331 // BNT
const source_amount = 10
bancorx.bancorFormula(source_balance, target_balance, source_amount)
//=> 55.19109809221157
```

## Parse Memo

```js
const memo = bancorx.parseMemo("bnt2eoscnvrt BNT bancorc11144 CUSD", "3.17", "b1")
//=> "1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,b1"
```

## Relays

| **symbol** | **code**     | **account**  | **symbol** |
|------------|--------------|--------------|------------|
| EOS        | eosio.token  | bnt2eoscnvrt | 4          |
| BNT        | bntbntbntbnt | bnt2eoscnvrt | 10         |
| ZOS        | zosdiscounts | bancorc11151 | 4          |
| IQ         | everipediaiq | bancorc11123 | 3          |
| PGL        | prospectorsg | bancorc11113 | 4          |
| CUSD       | stablecarbon | bancorc11144 | 2          |
| DICE       | betdicetoken | bancorc11125 | 2          |
| BLACK      | eosblackteam | bancorc11111 | 4          |
| CET        | eosiochaince | bancorc11114 | 4          |
| EPRA       | epraofficial | bancorc11124 | 4          |
| MEETONE    | eosiomeetone | bancorc11122 | 4          |
| ZKS        | zkstokensr4u | bancorc11142 | 0          |
| OCT        | octtothemoon | bancorc11132 | 4          |
| KARMA      | therealkarma | bancorc11112 | 4          |
| HVT        | hirevibeshvt | bancorc11131 | 4          |
| HORUS      | horustokenio | bancorc11121 | 4          |
| MEV        | eosvegascoin | bancorc11134 | 4          |

```js
bancorx.relays.CUSD
// {
//     code: "stablecarbon",
//     account: "bancorc11144",
//     symbol: "CUSD",
//     precision: 2
// }
```

## Get Relay Balances

[`eosjs`](https://github.com/EOSIO/eosjs) is required to use `get_currency_balance` method.

```js
const {code, account, symbol} = bancorx.relays.CUSD;
const balance = await rpc.get_currency_balance(code, account, symbol);
```