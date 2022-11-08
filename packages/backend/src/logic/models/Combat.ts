import {
  Model,
  Promised,
  promisedInstance,
  registerModel,
} from '@rouby/event-sourcing';
import { Vector } from '../../util';
import { CombatCardId } from '../combat';
import type { AppEvent } from '../events';
import type { Player } from './Player';
import type { Ship } from './Ship';

export class Combat extends Model {
  readonly kind = 'Combat';

  public constructor(public id: string) {
    super();
  }

  public game = promisedInstance('Game', { id: '' });
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

  protected applyEvent(event: AppEvent) {
    if (event.type === 'engageCombat' && event.payload.id === this.id) {
      this.game = promisedInstance('Game', { id: event.payload.gameId });
      this.coordinates = new Vector(event.payload.coordinates);
      this.parties = event.payload.parties.map((party) => ({
        player: promisedInstance('Player', {
          gameId: event.payload.gameId,
          userId: party.userId,
        }),
        ships: party.shipIds.map((shipId) =>
          promisedInstance('Ship', { id: shipId }),
        ),
        versus: party.versus.map((versus) => ({
          player: promisedInstance('Player', {
            gameId: event.payload.gameId,
            userId: versus.userId,
          }),
          ships: versus.shipIds.map((shipId) =>
            promisedInstance('Ship', { id: shipId }),
          ),
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
        ship: promisedInstance('Ship', { id: event.payload.shipId }),
        source: promisedInstance('Ship', { id: event.payload.sourceShipId }),
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

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    Combat: Combat;
  }
}

registerModel('Combat', Combat);
