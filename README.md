# BancorX utility

> Collection of useful Javascript (Typescript) methods used for [BancorX](https://eos.bancor.network).
>
> Wallet (Lynx/Scatter, etc...) `transfer` actions are not included.

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

## Relays

| **symbol** | **code**     | **account**  | **precision** |
| ---------- | ------------ | ------------ | ------------- |
| EOS        | eosio.token  | bnt2eoscnvrt | 4             |
| BNT        | bntbntbntbnt | bnt2eoscnvrt | 10            |
| ZOS        | zosdiscounts | bancorc11151 | 4             |
| IQ         | everipediaiq | bancorc11123 | 3             |
| PGL        | prospectorsg | bancorc11113 | 4             |
| CUSD       | stablecarbon | bancorc11144 | 2             |
| DICE       | betdicetoken | bancorc11125 | 2             |
| BLACK      | eosblackteam | bancorc11111 | 4             |
| CET        | eosiochaince | bancorc11114 | 4             |
| EPRA       | epraofficial | bancorc11124 | 4             |
| MEETONE    | eosiomeetone | bancorc11122 | 4             |
| ZKS        | zkstokensr4u | bancorc11142 | 0             |
| OCT        | octtothemoon | bancorc11132 | 4             |
| KARMA      | therealkarma | bancorc11112 | 4             |
| HVT        | hirevibeshvt | bancorc11131 | 4             |
| HORUS      | horustokenio | bancorc11121 | 4             |
| MEV        | eosvegascoin | bancorc11134 | 4             |
| SENSE      | sensegenesis | bnr512553153 | 4             |
| USDT       | tethertether | bancorc11232 | 4             |

## Get Relay Balances

[`eosjs`](https://github.com/EOSIO/eosjs) is required to use `get_currency_balance` method.

```js
const {code, account, symbol} = bancorx.relays.CUSD;
const balance = await rpc.get_currency_balance(code, account, symbol);
// => [ '24874.22 CUSD' ]
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [calculateReturn](#calculateReturn)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
-   [calculateCost](#calculateCost)
    -   [Parameters](#parameters-1)
    -   [Examples](#examples-1)
-   [composeMemo](#composememo)
    -   [Parameters](#parameters-2)
    -   [Examples](#examples-2)
-   [parseBalance](#parsebalance)
    -   [Parameters](#parameters-3)
    -   [Examples](#examples-3)
-   [relays](#relays)
    -   [Examples](#examples-4)

### calculateReturn

Bancor Formula

-   token balance of EOS (eosio.token) in the relay: 77814.0638 EOS
-   token balance of BNT (bntbntbntbnt) in the relay: 429519.5539120331 BNT

```js
Formula:
1.0000 / (77814.0638 + 1.0000) * 429519.5539120331
// => 5.519748143058556
```

#### Parameters

-   `balanceFrom` **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** from token balance in the relay
-   `balanceTo` **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** to token balance in the relay
-   `amount` **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** amount to convert

#### Examples

```javascript
const balanceFrom = split(`77814.0638 EOS`)
const balanceTo = split(`429519.5539120331 BNT`)
const amount = split(`1.0000 EOS`)

bancorx.calculateReturn(balanceFrom, balanceTo, amount)
// => 5.519748143058556
```

Returns **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** computed amount

### calculateCost

Bancor Inverse Formula

-   token balance of EOS (eosio.token) in the relay: 77814.0638 EOS
-   token balance of BNT (bntbntbntbnt) in the relay: 429519.5539120331 BNT

```js
Inverse Formula:
77814.0638 / (1.0 - 1 / 429519.5539120331) - 77814.0638
// => 0.18116577989712823
```

#### Parameters

-   `balanceFrom` **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** from token balance in the relay
-   `balanceTo` **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** to token balance in the relay
-   `amountDesired` **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** amount to desired

#### Examples

```javascript
const balanceFrom = split(`77814.0638 EOS`)
const balanceTo = split(`429519.5539120331 BNT`)
const amountDesired = split(`1.0000 EOS`)

bancorx.calculateCost(balanceFrom, balanceTo, amountDesired)
// => 0.18116577989712823
```

Returns **[Asset](https://github.com/EOS-Nation/eos-common#constructor)** computed desired amount

### composeMemo

Parse Memo

#### Parameters

-   `converters` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Converter>** relay converters
-   `minReturn` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** minimum return
-   `destAccount` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** destination acccount
-   `version` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** bancor protocol version (optional, default `1`)

#### Examples

```javascript
const CUSD = bancorx.relays.CUSD;
const BNT = bancorx.relays.BNT;

// Single converter (BNT => CUSD)
bancorx.composeMemo([CUSD], "3.17", "<account>")
// => "1,bancorc11144 CUSD,3.17,<account>"

// Multi converter (EOS => BNT => CUSD)
bancorx.composeMemo([BNT, CUSD], "3.17", "<account>")
// => "1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>"
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** computed memo

### parseBalance

Parse Balance

#### Parameters

-   `balance` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number))** token balance

#### Examples

```javascript
bancorx.parseBalance("10.0000 EOS") // => {quantity: 10.0, symbol: "EOS"}
bancorx.parseBalance(10.0) // => {quantity: 10.0}
```

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** parsed balance

### relays

Relays

#### Examples

```javascript
bancorx.relays.BNT
// => { code: "bntbntbntbnt", account: "bnt2eoscnvrt", symbol: "BNT", precision: 10 }

bancorx.relays.CUSD
// => { code: "stablecarbon", account: "bancorc11144", symbol: "CUSD", precision: 2 }
```
