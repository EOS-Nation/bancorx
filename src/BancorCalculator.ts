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

  private oppositeToken(relay: Relay, notDesired: Symbol): Token | undefined {
    return relay.reserves.find(token => !token.symbol.isEqual(notDesired));
  }

  private findPath(
    lastFrom: Symbol,
    to: Symbol,
    relays: Relay[],
    relaysPath: Relay[] = []
  ) {
    // Scope to search relays
    // Start off with all relays which contain originating symbol
    // Else dismiss it of any relays already used and all relays related to lastFrom
    const relaysScope =
      relaysPath.length == 0
        ? this.relaysContainingSymbol(relays, lastFrom)
        : this.restrictScope(relays, relaysPath, lastFrom);

    const direct = this.findDesired(relaysScope, to);
    if (direct) {
      this.callback([...relaysPath, direct]);
      return;
    }
    relaysScope.forEach(relay => {
      const token: Token = this.oppositeToken(relay, lastFrom)!!;
      this.findPath(token.symbol, to, relaysScope, [...relaysPath, relay]);
    });
  }

  public async calculateReturn(
    amount: Asset,
    desired: Symbol,
    callback: (data: Relay[]) => void
  ) {
    this.callback = callback;
    return this.findPath(amount.symbol, desired, this.relays);
  }
}

//
// Main function

// From Symbol - To Symbol
// Return path from to to
// Pushing to an empty array
// Keep going until to symbol is reached
