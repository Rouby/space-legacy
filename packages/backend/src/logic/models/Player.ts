import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { proxies, type Promised } from './proxies';
import type { ShipDesign } from './ShipDesign';

export class Player {
  readonly kind = 'Player';

  static async get(gameId: string, userId: string) {
    const player = new Player(gameId, userId);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      player.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return player;
  }

  private constructor(public gameId: string, public userId: string) {}

  public game = proxies.gameProxy(this.gameId);
  public user = proxies.userProxy(this.userId);
  public turnEnded = false;
  public relationships = {} as { [userId: string]: 'friendly' | 'hostile' };
  public name = 'New Player';
  public availableShipDesigns = [] as Promised<ShipDesign>[];

  applyEvent(event: AppEvent) {
    if (
      event.type === 'joinGame' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId !== this.userId
    ) {
      this.relationships[event.payload.userId] = 'hostile';
    }

    if (
      event.type === 'endTurn' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId === this.userId
    ) {
      this.turnEnded = true;
    }

    if (event.type === 'nextRound' && event.payload.gameId === this.gameId) {
      this.turnEnded = false;
    }

    if (
      event.type === 'createShipDesign' &&
      event.payload.gameId === this.gameId &&
      event.payload.userId === this.userId
    ) {
      this.availableShipDesigns.push(proxies.shipDesignProxy(event.payload.id));
    }
  }
}

export type PromisedPlayer = Player | Promised<Player>;
