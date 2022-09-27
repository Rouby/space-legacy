import type { GameEvent } from '@prisma/client';
import { getDbClient, Vector } from '../../util';
import type { AppEvent } from '../events';
import type { CombatCardId } from '../events/engageCombat';
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
  public coordinates = new Vector();
  public parties = [] as {
    player: Promised<Player>;
    ships: Promised<Ship>[];
    versus: {
      player: Promised<Player>;
      ships: Promised<Ship>[];
    }[];
    cardIdsInHand: CombatCardId[];
    cardIdsInDeck: CombatCardId[];
  }[];
  public ships = [] as Promised<Ship>[];

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
        cardIdsInHand: party.cardIdsInHand,
        cardIdsInDeck: party.cardIdsInDeck,
      }));
      this.ships = this.parties.flatMap((party) => party.ships);
    }
  }
}
