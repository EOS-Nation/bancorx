import { Symbol, Asset } from "eos-common";
import _ from "underscore";

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
  path: Relay[];
  callback: any;

  constructor(tokens: Token[], relays: Relay[]) {
    this.tokens = tokens;
    this.relays = relays;
    this.path = [];
  }

  private pushPath(x: any) {
    console.log("received", x);
  }

  private filterDesired(relays: Relay[], desired: Symbol) {
    return relays.filter(relay =>
      relay.reserves.some(token => token.symbol.isEqual(desired))
    );
  }

  private filterNotDesired(relays: Relay[], desired: Symbol) {
    return relays.filter(relay =>
      relay.reserves.some(token => !token.symbol.isEqual(desired))
    );
  }

  private newOptions(relays: Relay[], ban: Relay[], require: Symbol) {
    const x = relays.filter(relay => {
      return ban.some(r => !_.intersection(relay.reserves, r.reserves).length);
    });

    console.log(x, "was the x in new options");

    const y = x.filter(relay => {
      console.log({ relay }, "g");
      return relay.reserves.some(token => token.symbol.isEqual(require));
    });

    return y;
  }

  private findDesired(relays: Relay[], desired: Symbol) {
    return relays.find(relay =>
      relay.reserves.some(token => token.symbol.isEqual(desired))
    );
  }

  // @ts-ignore
  private findPath(lastFrom: Symbol, to: Symbol, path: Relay[] = []) {
    console.log("hit hit", path);
    // Going backwards?
    let lastFromRelays;
    if (path.length == 0) {
      lastFromRelays = this.filterDesired(this.relays, lastFrom);
    } else {
      lastFromRelays = this.newOptions(this.relays, path, lastFrom);
      console.log(lastFromRelays, "was new options");
    }
    const direct = this.findDesired(lastFromRelays, to);
    if (direct) {
      console.log("Direct found!");
      const yy = [...path, direct];
      console.log(JSON.stringify(yy));
      this.callback(yy)
      return yy;
    }
    // @ts-ignore
    lastFromRelays.forEach(relay => {
      const token = relay.reserves.find(
        token => !token.symbol.isEqual(lastFrom)
      );
      if (token) {
        /// @ts-ignore
        this.findPath(token.symbol, to, [...path, relay]);
      }
    });

  }

  public async calculateReturn(amount: Asset, desired: Symbol, callback: any) {
    this.callback = callback;
    return this.findPath(amount.symbol, desired);
  }
}

//
// Main function

// From Symbol - To Symbol
// Return path from to to
// Pushing to an empty array
// Keep going until to symbol is reached
