import { Symbol, Asset } from "eos-common";
import _ from "underscore";
import { calculateReturn, createPath, calculateCost } from "./index";
import {
  nRelay,
  EosAccount,
  HydratedRelay,
  TokenAmount,
  TokenSymbol
} from "./interfaces";

export abstract class AbstractBancorCalculator {

  public async estimateCost(
    amountDesired: Asset,
    from: Symbol
  ): Promise<Asset> {
    const reverseRelaysRequired = createPath(
      amountDesired.symbol,
      from,
      await this.fetchRelays()
    );

    const hydratedRelays = await this.hydrateRelays(reverseRelaysRequired);

    const costAmount = hydratedRelays.reduce((lastCost, relay) => {
      const fromReserveBalance = relay.reserves.find((reserve: TokenAmount) =>
        reserve.amount.symbol.isEqual(lastCost.symbol)
      )!;
      const toReserveBalance = relay.reserves.find(
        (reserve: TokenAmount) =>
          !reserve.amount.symbol.isEqual(lastCost.symbol)
      )!;

      const result = calculateCost(
        toReserveBalance.amount,
        fromReserveBalance.amount,
        lastCost
      );
      return result;
    }, amountDesired);
    return costAmount;
  }

  public async estimateReturn(amount: Asset, to: Symbol): Promise<Asset> {
    const relaysRequired = createPath(
      amount.symbol,
      to,
      await this.fetchRelays()
    );
    const hydratedRelays = await this.hydrateRelays(relaysRequired);

    const returnAmount = hydratedRelays.reduce((lastReward, relay) => {
      const fromReserveBalance = relay.reserves.find((reserve: TokenAmount) =>
        reserve.amount.symbol.isEqual(lastReward.symbol)
      )!;
      const toReserveBalance = relay.reserves.find(
        (reserve: TokenAmount) =>
          !reserve.amount.symbol.isEqual(lastReward.symbol)
      )!;
      const result = calculateReturn(
        fromReserveBalance.amount,
        toReserveBalance.amount,
        lastReward
      );
      return result;
    }, amount);

    return returnAmount;
  }

  // Fetch balance returns Assets of the things
  private hydrateRelay(balances: Asset[], relay: nRelay): HydratedRelay {
    const result = {
      ...relay,
      fee: 0,
      reserves: relay.reserves.map((reserve: TokenSymbol) => ({
        amount: balances.find(balance =>
          balance.symbol.isEqual(reserve.symbol)
        )!,
        contract: reserve.contract
      }))
    };
    if (result.reserves.every(reserve => Boolean(reserve.amount)))
      return result;
    throw new Error("Reserve mismatch in relays");
  }

  public async hydrateRelays(relays: nRelay[]): Promise<HydratedRelay[]> {
    const hydratedRelays = [];

    for (var i = 0; i < relays.length; i++) {
      let reserves: Asset[] = relays[i].isMultiContract
        ? await this.fetchMultiRelayReserves(
            relays[i].contract,
            relays[i].smartToken.symbol.code()
          )
        : await this.fetchSingleRelayReserves(relays[i].contract);
      let newRelay: HydratedRelay = this.hydrateRelay(reserves, relays[i]);
      // @ts-ignore
      hydratedRelays.push(newRelay);
    }

    return hydratedRelays;
  }

  abstract async fetchSingleRelayReserves(
    contractName: EosAccount
  ): Promise<Asset[]>;
  abstract async fetchMultiRelayReserves(
    contractName: EosAccount,
    smartSymbol: string
  ): Promise<Asset[]>;
  abstract async fetchSmartTokenSupply(
    contractName: EosAccount,
    symbolCode: string
  ): Promise<Asset>;
  abstract async fetchRelays(): Promise<nRelay[]>;
}
