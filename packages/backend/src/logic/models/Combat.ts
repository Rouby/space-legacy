import type { GameEvent } from '@prisma/client';
import { getDbClient } from '../../util';
import type { AppEvent } from '../events';
import { proxies } from './proxies';
import type { Ship } from './Ship';

export class Combat {
  readonly kind = 'Combat';

  static async get(gameId: string) {
    const combat = new Combat(gameId);

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

  private constructor(public gameId: string) {}

  public game = proxies.gameProxy(this.gameId);
  public relationship = {} as {
    [userId: string]: { [userId: string]: 'friendly' | 'hostile' };
  };
  public shipPositions = {} as { [position: string]: string[] };

  public async getActiveCombats() {
    const fights = await Promise.all(
      Object.entries(this.shipPositions)
        .filter(([, ships]) => ships.length > 1)
        .map(async ([position, shipIds]) => {
          const ships = await Promise.all(
            shipIds.map((id) => proxies.shipProxy(id).$resolve),
          );
          const shipsByUser = ships.reduce((acc, ship) => {
            if (!acc[ship.owner.userId]) {
              acc[ship.owner.userId] = [];
            }
            acc[ship.owner.userId].push(ship);
            return acc;
          }, {} as { [userId: string]: Ship[] });
          const userIds = Object.keys(shipsByUser);

          const coordinates = position.split(',').reduce(
            (acc, val, idx) => {
              if (idx === 0) {
                acc.x = parseInt(val);
              }
              if (idx === 1) {
                acc.y = parseInt(val);
              }
              return acc;
            },
            { x: 0, y: 0 },
          );
          const fights = userIds
            .map((userId) => ({
              coordinates,
              userId,
              vsOtherUserIds: userIds.filter(
                (otherUserId) =>
                  this.relationship[userId][otherUserId] === 'hostile',
              ),
            }))
            .filter(({ vsOtherUserIds }) => vsOtherUserIds.length > 0);

          return fights;
        }),
    ).then((arr) => arr.flat());

    return fights;
  }

  applyEvent(event: AppEvent) {
    if (event.type === 'joinGame' && event.payload.gameId === this.gameId) {
      const otherUserIds = Object.keys(this.relationship);
      this.relationship[event.payload.userId] = {};
      for (const userId of otherUserIds) {
        this.relationship[userId][event.payload.userId] = 'hostile';
        this.relationship[event.payload.userId][userId] = 'hostile';
      }
    }

    if (event.type === 'moveShip' && event.payload.gameId === this.gameId) {
      const pos = `${event.payload.to.x},${event.payload.to.y}`;
      if (!this.shipPositions[pos]) {
        this.shipPositions[pos] = [];
      }
      this.shipPositions[pos].push(event.payload.shipId);
    }
  }
}
