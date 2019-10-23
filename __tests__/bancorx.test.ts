import * as bancorx from "../src";
import { split, Symbol, Asset } from "eos-common";
import _ from 'underscore'

const trades = [
  [`1.0000 BLU`, `100.0000 BLU`, `100.0000 RED`, `0.9900 RED`],
  [`2.0000 BLU`, `101.0000 BLU`, `99.0100 RED`, `1.9225 RED`],
  [`4.0000 BLU`, `103.0000 BLU`, `97.0875 RED`, `3.6294 RED`],
  [`8.0000 BLU`, `107.0000 BLU`, `93.4581 RED`, `6.5014 RED`],
  [`16.0000 BLU`, `115.0000 BLU`, `86.9567 RED`, `10.6206 RED`],
  [`32.0000 BLU`, `131.0000 BLU`, `76.3361 RED`, `14.9862 RED`],
  [`64.0000 BLU`, `163.0000 BLU`, `61.3499 RED`, `17.2968 RED`],
  [`128.0000 BLU`, `227.0000 BLU`, `44.0531 RED`, `15.8839 RED`],
  [`256.0000 BLU`, `355.0000 BLU`, `28.1692 RED`, `11.8024 RED`],
  [`512.0000 BLU`, `611.0000 BLU`, `16.3668 RED`, `7.4619 RED`],
  [`1024.0000 BLU`, `1123.0000 BLU`, `8.9049 RED`, `4.2471 RED`],
  [`2048.0000 BLU`, `2147.0000 BLU`, `4.6578 RED`, `2.2738 RED`],
  [`4096.0000 BLU`, `4195.0000 BLU`, `2.3840 RED`, `1.1777 RED`],
  [`2.6719 BLU`, `8291.0000 BLU`, `1.2063 RED`, `0.0002 RED`],
  [`2.6901 RED`, `1.2061 RED`, `8293.6719 BLU`, `5726.2991 BLU`],
  [`3.0000 RED`, `3.8962 RED`, `2567.3728 BLU`, `1116.8641 BLU`],
  [`0.0010 EOS`, `2.8138 EOS`, `0.24864909 BTC`, `0.00008833 BTC`]
];


test.only('tes', () => {


  const array1 = [1,2,3,4,5]
  const array2 = [9,6,2,77,5]
  const common = _.intersection(array1, array2)

  expect(common).toEqual([2,5])
})

test("bancorx.bancorFormula - EOS/BNT", () => {
  trades
    .map(([amount, bluBalance, redBalance, reward]) => [
      split(amount),
      split(bluBalance),
      split(redBalance),
      split(reward)
    ])
    .forEach(([amount, blueBalance, redBalance, reward]) => {
      expect(bancorx.bancorFormula(blueBalance, redBalance, amount)).toEqual(
        reward
      );
    });
});

test.skip("bancorx.bancorInverseFormula - EOS/BNT", () => {
  trades
    .map(([amount, bluBalance, redBalance, reward]) => [
      split(amount),
      split(bluBalance),
      split(redBalance),
      split(reward)
    ])
    .forEach(([amount, blueBalance, redBalance, reward]) => {
      expect(
        bancorx.bancorInverseFormula(blueBalance, redBalance, reward)
      ).toEqual(amount);
    });
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

const EOS: Symbol = new Symbol("EOS", 4);
const BNT: Symbol = new Symbol("BNT", 4);
const EOSDT: Symbol = new Symbol("EOSDT", 4);
const BTC: Symbol = new Symbol("BTC", 4);

const EosDtandBtc = {
  reserves: [
    {
      contract: "sdasd",
      symbol: EOSDT
    },
    {
      contract: "labelaarbaro",
      symbol: BTC
    }
  ],
  smartToken: {
    contract: "labelaarbaro",
    symbol: new Symbol("BNTBTC", 4)
  },
  contract: "rockup.xyz"
};

const BNTandEos = {
  reserves: [
    {
      contract: "eosio.token",
      symbol: EOS
    },
    {
      contract: "bntbntbntbnt",
      symbol: BNT
    }
  ],
  smartToken: {
    contract: "labelaarbaro",
    symbol: new Symbol("BNTEOS", 4)
  },
  contract: "rockup.xyz"
};

const eosDtAndBnt = {
  reserves: [
    {
      contract: "eosdt",
      symbol: EOSDT
    },
    {
      contract: "bntbntbnt",
      symbol: BNT
    }
  ],
  smartToken: {
    contract: "labelaarbaro",
    symbol: new Symbol("BNTDT", 4)
  },
  contract: "zomglol"
};

const relays: bancorx.Relay[] = [eosDtAndBnt, BNTandEos, EosDtandBtc];

test.only("path works", async () => {
  const eosAmount = split(`1.0000 EOS`);
  const bntAmount = split(`1.0000 BNT`);

  const calculator = new bancorx.BancorCalculator([], relays);
  // expect(await calculator.calculateReturn(eosAmount, BNT)).toEqual([BNTandEos])
  // @ts-ignore
  await calculator.calculateReturn(eosAmount, BTC, (data) => {
    expect(data).toEqual([BNTandEos, eosDtAndBnt, EosDtandBtc]);
  })
});
