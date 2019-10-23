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
  callback: any;

  constructor(tokens: Token[], relays: Relay[]) {
    this.tokens = tokens;
    this.relays = relays;
  }

  // Returns all relays trading a particular symbol
  private relaysContainingSymbol(relays: Relay[], desired: Symbol) {
    return relays.filter(relay =>
      relay.reserves.some(token => token.symbol.isEqual(desired))
    );
  }

  
  private restrictScope(relays: Relay[], banned: Relay[], require: Symbol) {
    const withoutUsedRelays = relays.filter(relay => {
      return banned.some(
        r => !_.intersection(relay.reserves, r.reserves).length
      );
    });

    return this.relaysContainingSymbol(withoutUsedRelays, require);
  }

  private findDesired(relays: Relay[], desired: Symbol) {
    return relays.find(relay =>
      relay.reserves.some(token => token.symbol.isEqual(desired))
    );
  }

  private findPath(lastFrom: Symbol, to: Symbol, relaysPath: Relay[] = []) {
    // Scope to search relays
    // Start off with all relays which contain originating symbol
    // Else dismiss it of any relays already used and all relays related to lastFrom
    const relaysScope =
      relaysPath.length == 0
        ? this.relaysContainingSymbol(this.relays, lastFrom)
        : this.restrictScope(this.relays, relaysPath, lastFrom);

    const direct = this.findDesired(relaysScope, to);
    if (direct) {
      this.callback([...relaysPath, direct]);
      return;
    }
    relaysScope.forEach(relay => {
      const token = relay.reserves.find(
        token => !token.symbol.isEqual(lastFrom)
      )!!;
      this.findPath(token.symbol, to, [...relaysPath, relay]);
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
