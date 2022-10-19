import type { GameEvent } from '@prisma/client';
import { getDbClient, Vector } from '../../util';
import { CombatCardId } from '../combat';
import type { AppEvent } from '../events';

import type { Player } from './Player';
import { Promised, proxies } from './proxies';
import type { Ship } from './Ship';

export class Combat {
  readonly kind = 'Combat';

  static async get(id: string) {
    const combat = new Combat(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      combat.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return combat;
  }

  private constructor(public id: string) {}

  public game = proxies.gameProxy('');
  public round = 0;
  public inProgress = false;
  public coordinates = new Vector();
  public parties = [] as {
    player: Promised<Player>;
    ships: Promised<Ship>[];
    versus: {
      player: Promised<Player>;
      ships: Promised<Ship>[];
    }[];
    cardsInHand: CombatCardId[];
    cardsInDeck: CombatCardId[];
    cardsInDiscard: CombatCardId[];
    cardPlayed: CombatCardId | null;
    handSize: number;
  }[];
  public ships = [] as Promised<Ship>[];
  public log = [] as {
    round: number;
    cardsPlayed: {
      player: Promised<Player>;
      card: CombatCardId;
    }[];
    damageReports: {
      ship: Promised<Ship>;
      source: Promised<Ship>;
      damage: number;
    }[];
  }[];

  applyEvent(event: AppEvent) {
    if (event.type === 'engageCombat' && event.payload.id === this.id) {
      this.game = proxies.gameProxy(event.payload.gameId);
      this.coordinates = new Vector(event.payload.coordinates);
      this.parties = event.payload.parties.map((party) => ({
        player: proxies.playerProxy(event.payload.gameId, party.userId),
        ships: party.shipIds.map((shipId) => proxies.shipProxy(shipId)),
        versus: party.versus.map((versus) => ({
          player: proxies.playerProxy(event.payload.gameId, versus.userId),
          ships: versus.shipIds.map((shipId) => proxies.shipProxy(shipId)),
        })),
        cardsInHand: party.cardIdsInHand,
        cardsInDeck: party.cardIdsInDeck,
        cardsInDiscard: [],
        cardPlayed: null,
        handSize: 2,
      }));
      this.ships = this.parties.flatMap((party) => party.ships);
      this.inProgress = true;
      this.log = [
        {
          round: 0,
          cardsPlayed: [],
          damageReports: [],
        },
      ];
    }

    if (event.type === 'playCombatCard' && event.payload.combatId === this.id) {
      this.parties
        .filter((party) => party.player.userId === event.payload.userId)
        .forEach((party) => {
          party.cardPlayed = event.payload.cardId;
          party.cardsInHand = party.cardsInHand.filter(
            (cardId) => cardId !== event.payload.cardId,
          );
        });
    }

    if (
      event.type === 'nextCombatRound' &&
      event.payload.combatId === this.id
    ) {
      this.parties.forEach((party) => {
        party.cardsInDiscard.push(party.cardPlayed!);
        party.cardPlayed = null;
        this.log.at(this.round)!.cardsPlayed.push({
          player: party.player,
          card: party.cardsInDiscard.at(-1)!,
        });
      });
      this.round++;
      this.log.push({
        round: this.round,
        cardsPlayed: [],
        damageReports: [],
      });
    }

    if (event.type === 'destroyShip' && this.id === event.payload.combatId) {
      this.ships = this.ships.filter(
        (ship) => ship.id !== event.payload.shipId,
      );
      this.parties.forEach((party) => {
        party.ships = party.ships.filter(
          (ship) => ship.id !== event.payload.shipId,
        );
        party.versus.forEach((versus) => {
          versus.ships = versus.ships.filter(
            (ship) => ship.id !== event.payload.shipId,
          );
        });
      });
    }

    if (event.type === 'restoreCombatDeck') {
      this.parties
        .filter((party) => party.player.userId === event.payload.userId)
        .forEach((party) => {
          party.cardsInDeck.push(...party.cardsInDiscard);
          party.cardsInDiscard = [];
        });
    }

    if (event.type === 'drawCombatCard') {
      this.parties
        .filter((party) => party.player.userId === event.payload.userId)
        .forEach((party) => {
          party.cardsInDeck.shift();
          party.cardsInHand.push(event.payload.cardId);
        });
    }

    if (event.type === 'damageShip' && event.payload.combatId === this.id) {
      this.log.at(this.round)!.damageReports.push({
        ship: proxies.shipProxy(event.payload.shipId),
        source: proxies.shipProxy(event.payload.sourceShipId),
        damage: event.payload.damage,
      });
    }

    if (event.type === 'endCombat' && event.payload.combatId === this.id) {
      this.inProgress = false;
      this.parties.forEach((party) => {
        if (party.cardPlayed) {
          this.log.at(this.round)!.cardsPlayed.push({
            player: party.player,
            card: party.cardPlayed,
          });
        }
      });
    }
  }
}
