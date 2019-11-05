import { Symbol, Asset } from "eos-common";

export interface Relay {
  code: string;
  account: string;
  symbol: string;
  precision: number;
}

export interface Relays {
  EOS: Relay;
  BNT: Relay;

  BLACK: Relay;
  KARMA: Relay;
  PGL: Relay;
  CET: Relay;
  HORUS: Relay;
  MEETONE: Relay;
  IQ: Relay;
  EPRA: Relay;
  DICE: Relay;
  HVT: Relay;

  OCT: Relay;
  MEV: Relay;
  ZKS: Relay;
  CUSD: Relay;
  TAEL: Relay;
  ZOS: Relay;
  EQUA: Relay;
  PEOS: Relay;
  DAPP: Relay;
  CHEX: Relay;

  NUT: Relay;
  EOSDT: Relay;
  STUFF: Relay;
  FINX: Relay;

  EMT: Relay;
  DRAGON: Relay;
  PIXEOS: Relay;
  LUME: Relay;
  SENSE: Relay;
  USDT: Relay;

  [relay: string]: Relay;
}

export interface Converter {
  account: string;
  symbol: string;
  multiContractSymbol?: string;
}

export type EosAccount = string;

export interface Token {
  contract: EosAccount;
  symbol: Symbol;
}

export interface TokenSymbol {
  contract: EosAccount;
  symbol: Symbol;
}

export interface ChoppedRelay {
  contract: string;
  reserves: TokenSymbol[];
}

export interface TokenAmount {
  contract: EosAccount;
  amount: Asset;
}

export interface HydratedRelay {
  reserves: TokenAmount[];
  smartToken: TokenSymbol;
  contract: EosAccount;
  isMultiContract: boolean;
}

export interface nRelay {
  reserves: TokenSymbol[];
  smartToken: TokenSymbol;
  contract: EosAccount;
  isMultiContract: boolean;
}
