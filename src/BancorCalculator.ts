import { Symbol, Asset } from "eos-common";

export type EosAccount = string;

export interface Token {
  contract: EosAccount;
  symbol: Symbol;
}

export interface Relay {
  reserves: Token[];
  smartToken: Token;
  contract: EosAccount;
}

export class BancorCalculator {
  tokens: Token[];
  relays: Relay[];

  constructor(tokens: Token[], relays: Relay[]) {
    this.tokens = tokens;
    this.relays = relays;
  }

  private findPath(from: Symbol, to: Symbol) {
    const direct = this.relays.find(relay =>
      relay.reserves.some(token => token.symbol == from && token.symbol == to)
    );

    if (direct) {
      console.log("direct thang");
      return [direct];
    } else {
      // Find all the relays which do match
      const fromMatches = this.relays.filter(relay =>
        relay.reserves.some(token => token.symbol.isEqual(from))
      );

      const toMatch = fromMatches.find(relay =>
        relay.reserves.some(token => token.symbol.isEqual(to))
      );
      console.log({ fromMatches, toMatch });
      return [fromMatches[0], toMatch];
    }
  }

  public async calculateReturn(amount: Asset, desired: Symbol) {
    const path = this.findPath(amount.symbol, desired);
    return path;
  }
}
