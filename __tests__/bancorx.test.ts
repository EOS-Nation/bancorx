import * as bancorx from "..";
import _ from "underscore";
import { asset, symbol } from "eos-common";
import { nRelay } from "../src/interfaces";
import { AbstractBancorCalculator } from "../src/AbstractBancorCalculator";
import wait from "waait";

// https://docs.google.com/spreadsheets/d/1Ke066umKRd5p897X0oNgMhkGzjk2GEDXoWDo21bVJpY/edit?usp=sharing

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

test.skip("bancorx.calculateReturn - EOS/BNT", () => {
  trades
    .map(([amount, bluBalance, redBalance, reward]) => [
      asset(amount),
      asset(bluBalance),
      asset(redBalance),
      asset(reward)
    ])
    .forEach(([amount, blueBalance, redBalance, reward]) => {
      expect(bancorx.calculateReturn(blueBalance, redBalance, amount)).toEqual(
        reward
      );
    });
});

test("calculate Cost will fail if attempting to buy entire reserve or more", () => {
  expect.assertions(3);
  const bntAsset = asset("10.1000000000 BNT");
  const eosAsset = asset("1.0000 EOS");
  const desired = asset("1.0000 EOS");
  try {
    bancorx.calculateCost(bntAsset, eosAsset, desired);
  } catch (e) {
    expect(e.message).toBe("Impossible to buy the entire reserve or more");
  }
  try {
    bancorx.calculateReturn(eosAsset, bntAsset, desired);
  } catch (e) {
    expect(e.message).toBe("Impossible to buy the entire reserve or more");
  }

  const bntAsset2 = asset("10.1000000000 BNT");
  const eosAsset2 = asset("1.0000 EOS");
  const desired2 = asset("1.1000 EOS");
  try {
    bancorx.calculateCost(bntAsset2, eosAsset2, desired2);
  } catch (e) {
    expect(e.message).toBe("Impossible to buy the entire reserve or more");
  }
});

test.skip("bancorx.calculateCost - EOS/BNT", () => {
  trades
    .map(([amount, bluBalance, redBalance, reward]) => [
      asset(amount),
      asset(bluBalance),
      asset(redBalance),
      asset(reward)
    ])
    .forEach(([amount, blueBalance, redBalance, reward]) => {
      expect(bancorx.calculateCost(blueBalance, redBalance, reward)).toEqual(
        amount
      );
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

const EOS: Symbol = symbol("EOS", 4);
const BNT: Symbol = symbol("BNT", 4);
const EOSDT: Symbol = symbol("EOSDT", 4);
const BTC: Symbol = symbol("BTC", 4);
const CAT: Symbol = symbol("CAT", 4);
const DOG: Symbol = symbol("DOG", 4);

const EOSDTandBTC: nRelay = {
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
    symbol: symbol("BTCDT", 4)
  },
  contract: "rockup.xyz",
  isMultiContract: false
};

const BTCandDOG: nRelay = {
  reserves: [
    {
      contract: "dwe",
      symbol: BTC
    },
    {
      contract: "fwet",
      symbol: DOG
    }
  ],
  smartToken: {
    contract: "labelaarbaro",
    symbol: symbol("BTCDOG", 4)
  },
  contract: "rockup.zxc",
  isMultiContract: true
};

const EOSandBNT: nRelay = {
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
    symbol: symbol("BNTEOS", 4)
  },
  contract: "rockup.xz",
  isMultiContract: false
};

const BNTandEOSDT: nRelay = {
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
    symbol: symbol("BNTDT", 4)
  },
  contract: "zomglol",
  isMultiContract: false
};

// write test for 'removeRelay' method
const CATandEOSDT: nRelay = {
  reserves: [
    {
      contract: "eosdt",
      symbol: EOSDT
    },
    {
      contract: "catcat",
      symbol: CAT
    }
  ],
  smartToken: {
    contract: "labelaarbaro",
    symbol: symbol("BNTCAT", 4)
  },
  contract: "fwefwef",
  isMultiContract: false
};

const relays: nRelay[] = [
  BNTandEOSDT,
  EOSandBNT,
  EOSDTandBTC,
  CATandEOSDT,
  BTCandDOG
];

test("getOpposite symbol function works", () => {
  expect(bancorx.getOppositeSymbol(BNTandEOSDT, EOSDT)).toEqual(BNT);
});

test("createPath works", () => {
  expect(bancorx.createPath(EOS, BTC, relays)).toEqual([
    EOSandBNT,
    BNTandEOSDT,
    EOSDTandBTC
  ]);

  expect(bancorx.createPath(EOS, CAT, relays)).toEqual([
    EOSandBNT,
    BNTandEOSDT,
    CATandEOSDT
  ]);

  expect(bancorx.createPath(CAT, EOSDT, relays)).toEqual([CATandEOSDT]);

  expect(bancorx.createPath(symbol("BNTCAT", 4), EOSDT, relays)).toEqual([
    CATandEOSDT
  ]);
});

// relayHasBothSymbols

test("can chop relays", () => {
  const choppedRelays = bancorx.chopRelays(relays);
  expect(choppedRelays).toEqual([
    {
      contract: "zomglol",
      reserves: [
        {
          contract: "eosdt",
          symbol: symbol("EOSDT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTDT", 4)
        }
      ]
    },
    {
      contract: "zomglol",
      reserves: [
        {
          contract: "bntbntbnt",
          symbol: symbol("BNT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTDT", 4)
        }
      ]
    },
    {
      contract: "rockup.xz",
      reserves: [
        {
          contract: "eosio.token",
          symbol: symbol("EOS", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTEOS", 4)
        }
      ]
    },
    {
      contract: "rockup.xz",
      reserves: [
        {
          contract: "bntbntbntbnt",
          symbol: symbol("BNT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTEOS", 4)
        }
      ]
    },
    {
      contract: "rockup.xyz",
      reserves: [
        {
          contract: "sdasd",
          symbol: symbol("EOSDT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDT", 4)
        }
      ]
    },
    {
      contract: "rockup.xyz",
      reserves: [
        {
          contract: "labelaarbaro",
          symbol: symbol("BTC", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDT", 4)
        }
      ]
    },
    {
      contract: "fwefwef",
      reserves: [
        {
          contract: "eosdt",
          symbol: symbol("EOSDT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTCAT", 4)
        }
      ]
    },
    {
      contract: "fwefwef",
      reserves: [
        {
          contract: "catcat",
          symbol: symbol("CAT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTCAT", 4)
        }
      ]
    },
    {
      contract: "rockup.zxc",
      reserves: [
        {
          contract: "dwe",
          symbol: symbol("BTC", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDOG", 4)
        }
      ]
    },
    {
      contract: "rockup.zxc",
      reserves: [
        {
          contract: "fwet",
          symbol: symbol("DOG", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDOG", 4)
        }
      ]
    }
  ]);
});

test("can chop relay", () => {
  const EOSandBNT: nRelay = {
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
      symbol: symbol("BNTEOS", 4)
    },
    contract: "rockup.xz",
    isMultiContract: false
  };

  const choppedRelay = bancorx.chopRelay(EOSandBNT);

  expect(choppedRelay).toEqual([
    {
      contract: "rockup.xz",
      reserves: [
        {
          contract: "eosio.token",
          symbol: EOS
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTEOS", 4)
        }
      ]
    },
    {
      contract: "rockup.xz",
      reserves: [
        {
          contract: "bntbntbntbnt",
          symbol: BNT
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTEOS", 4)
        }
      ]
    }
  ]);
});

test("remove chopped relay", () => {
  const EOSandBNT: nRelay = {
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
      symbol: symbol("BNTEOS", 4)
    },
    contract: "rockup.xz",
    isMultiContract: false
  };

  const choppedRelay = bancorx.chopRelay(EOSandBNT);

  expect(
    bancorx.removeChoppedRelay(
      [
        {
          contract: "zomglol",
          reserves: [
            {
              contract: "eosdt",
              symbol: symbol("EOSDT", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BNTDT", 4)
            }
          ]
        },
        {
          contract: "zomglol",
          reserves: [
            {
              contract: "bntbntbnt",
              symbol: symbol("BNT", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BNTDT", 4)
            }
          ]
        },
        {
          contract: "rockup.xz",
          reserves: [
            {
              contract: "eosio.token",
              symbol: symbol("EOS", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BNTEOS", 4)
            }
          ]
        },
        {
          contract: "rockup.xz",
          reserves: [
            {
              contract: "bntbntbntbnt",
              symbol: symbol("BNT", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BNTEOS", 4)
            }
          ]
        },
        {
          contract: "rockup.xyz",
          reserves: [
            {
              contract: "sdasd",
              symbol: symbol("EOSDT", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BTCDT", 4)
            }
          ]
        },
        {
          contract: "rockup.xyz",
          reserves: [
            {
              contract: "labelaarbaro",
              symbol: symbol("BTC", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BTCDT", 4)
            }
          ]
        },
        {
          contract: "fwefwef",
          reserves: [
            {
              contract: "eosdt",
              symbol: symbol("EOSDT", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BNTCAT", 4)
            }
          ]
        },
        {
          contract: "fwefwef",
          reserves: [
            {
              contract: "catcat",
              symbol: symbol("CAT", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BNTCAT", 4)
            }
          ]
        },
        {
          contract: "rockup.zxc",
          reserves: [
            {
              contract: "dwe",
              symbol: symbol("BTC", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BTCDOG", 4)
            }
          ]
        },
        {
          contract: "rockup.zxc",
          reserves: [
            {
              contract: "fwet",
              symbol: symbol("DOG", 4)
            },
            {
              contract: "labelaarbaro",
              symbol: symbol("BTCDOG", 4)
            }
          ]
        }
      ],
      choppedRelay[0]
    )
  ).toEqual([
    {
      contract: "zomglol",
      reserves: [
        {
          contract: "eosdt",
          symbol: symbol("EOSDT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTDT", 4)
        }
      ]
    },
    {
      contract: "zomglol",
      reserves: [
        {
          contract: "bntbntbnt",
          symbol: symbol("BNT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTDT", 4)
        }
      ]
    },
    {
      contract: "rockup.xz",
      reserves: [
        {
          contract: "bntbntbntbnt",
          symbol: symbol("BNT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTEOS", 4)
        }
      ]
    },
    {
      contract: "rockup.xyz",
      reserves: [
        {
          contract: "sdasd",
          symbol: symbol("EOSDT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDT", 4)
        }
      ]
    },
    {
      contract: "rockup.xyz",
      reserves: [
        {
          contract: "labelaarbaro",
          symbol: symbol("BTC", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDT", 4)
        }
      ]
    },
    {
      contract: "fwefwef",
      reserves: [
        {
          contract: "eosdt",
          symbol: symbol("EOSDT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTCAT", 4)
        }
      ]
    },
    {
      contract: "fwefwef",
      reserves: [
        {
          contract: "catcat",
          symbol: symbol("CAT", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BNTCAT", 4)
        }
      ]
    },
    {
      contract: "rockup.zxc",
      reserves: [
        {
          contract: "dwe",
          symbol: symbol("BTC", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDOG", 4)
        }
      ]
    },
    {
      contract: "rockup.zxc",
      reserves: [
        {
          contract: "fwet",
          symbol: symbol("DOG", 4)
        },
        {
          contract: "labelaarbaro",
          symbol: symbol("BTCDOG", 4)
        }
      ]
    }
  ]);
});

test("can get oppositeSymbol", () => {
  const EOSandBNT: nRelay = {
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
      symbol: symbol("BNTEOS", 4)
    },
    contract: "rockup.xz",
    isMultiContract: false
  };

  const choppedRelay = bancorx.chopRelay(EOSandBNT)[0];
  const res = bancorx.getOppositeSymbol(choppedRelay, EOS);
  expect(res).toEqual(symbol("BNTEOS", 4));
});

test("relay has both symbols", () => {
  const EOSandBNT: nRelay = {
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
      symbol: symbol("BNTEOS", 4)
    },
    contract: "rockup.xz",
    isMultiContract: false
  };

  const choppedRelay = bancorx.chopRelay(EOSandBNT)[0];

  let func = bancorx.relayHasBothSymbols(EOS, symbol("BNTEOS", 4));

  expect(func(choppedRelay)).toBe(true);

  func = bancorx.relayHasBothSymbols(EOS, symbol("BNTBNT", 4));
  expect(func(choppedRelay)).toBe(false);
});

test("createPath works with symbols", async () => {
  expect(bancorx.createPath(symbol("BNTCAT", 4), EOSDT, relays)).toEqual([
    CATandEOSDT
  ]);

  const res = bancorx.createPath(EOS, BTC, relays);
  expect(res).toEqual([EOSandBNT, BNTandEOSDT, EOSDTandBTC]);
});

test("relays to converters", () => {
  let res = bancorx.createPath(EOS, CAT, relays);
  expect(bancorx.relaysToConverters(EOS, res)).toEqual([
    { account: "rockup.xz", symbol: "BNT" },
    { account: "zomglol", symbol: "EOSDT" },
    { account: "fwefwef", symbol: "CAT" }
  ]);

  res = bancorx.createPath(EOS, DOG, relays);
  expect(res).toEqual([EOSandBNT, BNTandEOSDT, EOSDTandBTC, BTCandDOG]);

  expect(bancorx.relaysToConverters(EOS, res)).toEqual([
    { account: "rockup.xz", symbol: "BNT" },
    { account: "zomglol", symbol: "EOSDT" },
    { account: "rockup.xyz", symbol: "BTC" },
    { account: "rockup.zxc", symbol: "DOG", multiContractSymbol: "BTCDOG" }
  ]);
});

test("compose memo works with multicontracts", () => {
  const relaysList = bancorx.createPath(EOS, DOG, relays);
  const converters = bancorx.relaysToConverters(EOS, relaysList);
  expect(bancorx.composeMemo(converters, "0.0001", "thekellygang", 1)).toBe(
    `1,rockup.xz BNT zomglol EOSDT rockup.xyz BTC rockup.zxc:BTCDOG DOG,0.0001,thekellygang`
  );
});

const myRelays = [
  {
    contractName: "rockup.xz",
    reserves: [asset(`2.0000 EOS`), asset(`5.0000 BNT`)]
  },
  {
    contractName: `zomglol`,
    reserves: [asset(`2.5000 BNT`), asset(`6.0000 EOSDT`)]
  },
  {
    contractName: "rockup.xyz",
    reserves: [asset(`103.0000 BTC`), asset(`97.0875 EOSDT`)]
  }
];

class BancorCalculator extends AbstractBancorCalculator {
  async fetchMultiRelayReserves(contractName: string, symbolCode: string) {
    await wait();
    return [asset(`1.0000 EOS`), asset(`10.1000000000 BNT`)];
  }

  async fetchSingleRelayReserves(contractName: string) {
    await wait();
    return myRelays.find(reserve => reserve.contractName == contractName)!
      .reserves;
  }

  async fetchSmartTokenSupply(contractName: string, symbolCode: string) {
    await wait();
    return asset(`1.0000 EOS`);
  }

  async fetchRelays() {
    return relays;
  }
}

test.skip("bancor calculator - estimate return works", async () => {
  const x = new BancorCalculator();
  expect(await x.estimateReturn(asset(`4.0000 BTC`), EOSDT)).toStrictEqual(
    asset(`3.6294 EOSDT`)
  );

  expect(await x.estimateReturn(asset(`4.5000 EOS`), EOSDT)).toStrictEqual(
    asset(`3.4838 EOSDT`)
  );
});

test.skip("bancor calculator - estimate cost works", async () => {
  let bancorCalculator = new BancorCalculator();
  expect(
    await bancorCalculator.estimateCost(asset(`3.6294 EOSDT`), BTC)
  ).toStrictEqual(asset(`4.0000 BTC`));

  expect(
    await bancorCalculator.estimateCost(asset(`3.4838 EOSDT`), BTC)
  ).toStrictEqual(asset(`4.0000 BTC`));
});

test("fee works", () => {
  expect(bancorx.chargeFee(asset("1.0000 EOS"), 0.02, 2)).toStrictEqual(
    asset("0.9604 EOS")
  );
  expect(bancorx.chargeFee(asset("1.0000 EOS"), 0.02, 1)).toStrictEqual(
    asset("0.9800 EOS")
  );
});

test("works with a difference in precision", async () => {
  expect(
    bancorx.calculateCost(
      asset("5.0001 EMT"),
      asset("1.0000000000 BNT"),
      asset(`0.1666638889 BNT`)
    )
  ).toStrictEqual(asset(`0.9999 EMT`));
});

test("calculate Smart Return works as expected", async () => {
  const deposit = asset(`32.0000 BLU`);
  const blueBalance = asset("131.0000 BLU");
  const smartBalance = asset("200.0000 BLURED");

  expect(
    bancorx.calculateReserveToSmart(deposit, blueBalance, smartBalance)
  ).toStrictEqual(asset("23.0941 BLURED"));
});

test("calculate smart to reserve", async () => {
  const smartSupply = asset("200.0000 BLURED");
  const sellingTokens = asset("32.0000 BLURED");
  const blueBalance = asset("131.0000 BLU");
  const reserveTokens = asset("38.5664 BLU");

  expect(
    bancorx.calculateSmartToReserve(sellingTokens, blueBalance, smartSupply)
  ).toStrictEqual(reserveTokens);
});

test("more smart to reserve", async () => {
  const smartSupply = asset("1000.0000 EOSBTC");
  const btcBalance = asset("0.6500 BTC");
  const eosBalance = asset("20.0000 BTC");

  expect(
    bancorx.calculateSmartToReserve(smartSupply, btcBalance, smartSupply)
  ).toStrictEqual(btcBalance);
});

test("liquidate works", () => {
  expect(
    bancorx.liquidate(
      asset("100.0000 BNTEOS"),
      asset("2.0000 EOS"),
      asset("200.0000 BNTEOS")
    )
  ).toStrictEqual(asset("1.0000 EOS"));
});

test("calculate liquidate works", () => {
  expect(
    bancorx.calculateLiquidateCost(
      asset("1.0000 EOS"),
      asset("2.0000 EOS"),
      asset("200.0000 BNTEOS")
    )
  ).toStrictEqual(asset("100.0000 BNTEOS"));
});

test("random fund tests", () => {
  expect(
    bancorx.calculateFundReturn(
      asset("0.1884540589 BNT"),
      asset("1.8468895414 BNT"),
      asset("1495.0000 BNTKRX")
    )
  ).toStrictEqual(asset("152.5477 BNTKRX"));

  expect(
    bancorx.fund(
      asset("152.5477 BNTKRX"),
      asset("1.8468895414 BNT"),
      asset("1495.0000 BNTKRX")
    )
  ).toStrictEqual(asset("0.1884540145 BNT"));

  expect(
    bancorx.fund(
      asset("1000.00000000 BNTEOS"),
      asset("990.0000 EOS"),
      asset("99000.00000000 BNTEOS")
    )
  ).toStrictEqual(asset("9.9999 EOS"));

  expect(
    bancorx.calculateFundReturn(
      asset("10.0000 EOS"),
      asset("990.0000 EOS"),
      asset("99000.00000000 BNTEOS")
    )
  ).toStrictEqual(asset("1000.00000000 BNTEOS"));

  expect(
    bancorx.fund(
      asset("1000.00000000 BNTEOS"),
      asset("990.00000000 BNT"),
      asset("99000.00000000 BNTEOS")
    )
  ).toStrictEqual(asset("9.99999999 BNT"));

  expect(
    bancorx.fund(
      asset("2000.00000000 BNTEOS"),
      asset("990.00000000 BNT"),
      asset("99000.00000000 BNTEOS")
    )
  ).toStrictEqual(asset("19.99999999 BNT"));

  expect(
    bancorx.fund(
      asset("250.0000 BNTEOS"),
      asset("6.0000 EOS"),
      asset("1000.0000 BNTEOS")
    )
  ).toStrictEqual(asset("1.5000 EOS"));

  expect(
    bancorx.fund(
      asset("250.0000 BNTEOS"),
      asset("7.5000 EOS"),
      asset("1250.0000 BNTEOS")
    )
  ).toStrictEqual(asset("1.5000 EOS"));

  expect(
    bancorx.fund(
      asset("148.50000000 BNTEOS"),
      asset("990.0000 EOS"),
      asset("99000.00000000 BNTEOS")
    )
  ).toStrictEqual(asset("1.4850 EOS"));

  expect(
    bancorx.fund(
      asset("657.94500123 BNTEOS"),
      asset("991.4850 EOS"),
      asset("99148.50000000 BNTEOS")
    )
  ).toStrictEqual(asset("6.5794 EOS"));
});
