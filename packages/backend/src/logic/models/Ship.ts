import type { GameEvent } from '@prisma/client';
import { getDbClient, Vector } from '../../util';
import type { AppEvent } from '../events';
import { Promised, proxies } from './proxies';
import type { ShipDesign } from './ShipDesign';
import type { StarSystem } from './StarSystem';

export class Ship {
  readonly kind = 'Ship';

  static async get(id: string) {
    const ship = new Ship(id);

    const events = await (
      await getDbClient()
    ).gameEvent.findMany({
      orderBy: { createdAt: 'asc' },
    });

    events.forEach((event) => {
      ship.applyEvent({
        ...event,
        payload: JSON.parse(event.payload),
      } as Omit<GameEvent, 'payload'> & AppEvent);
    });

    return ship;
  }

  private constructor(public id: string) {}

  public game = proxies.gameProxy('');
  public owner = proxies.playerProxy('', '');
  public design = null as Promised<ShipDesign> | null;
  public name = '';
  public starSystem = null as Promised<StarSystem> | null;
  public coordinates = { x: 0, y: 0 };
  public movingTo = null as { x: number; y: number } | null;
  public followingShip = null as Promised<Ship> | null;
  public followingPredictive = false;
  public movementVector = { x: 0, y: 0 };

  public get combats() {
    return Promise.resolve().then(async () => {
      const game = await this.game.$resolve;
      const combats = await game.getActiveCombats();

      return combats.filter((combat) =>
        combat.ships.some((s) => s.id === this.id),
      );
    });
  }

  public async isVisibleTo(userId: string) {
    const visibility = await proxies.visibilityProxy(this.game!.id, userId)
      .$resolve;
    return visibility.checkVisibility(this.coordinates);
  }

  public async getFollowingMovingTo() {
    if (this.followingShip) {
      const followingShip = await this.followingShip.$resolve;

      if (this.followingPredictive) {
        const followingShipMovement = new Vector(
          followingShip.movementVector,
        ).multiply(10); // TODO get ship speed?
        let movingTo = new Vector(followingShip.coordinates).add(
          followingShipMovement,
        );
        for (let i = 1; i < 10; i++) {
          if (
            new Vector(this.coordinates).subtract(movingTo).magnitude() <
            10 * i
          ) {
            break;
          }
          movingTo = new Vector(movingTo).add(followingShipMovement);
        }
        return movingTo;
      } else {
        return followingShip.coordinates;
      }
    }

    return null;
  }

  private applyEvent(event: AppEvent) {
    if (event.type === 'launchShip' && event.payload.id === this.id) {
      this.game = proxies.gameProxy(event.payload.gameId);
      this.owner = proxies.playerProxy(
        event.payload.gameId,
        event.payload.userId,
      );
      this.design = proxies.shipDesignProxy(event.payload.designId);
      this.coordinates = event.payload.coordinates;
    }

    if (
      event.type === 'issueMoveOrder' &&
      event.payload.subjectId === this.id
    ) {
      if (
        event.payload.to.x === this.coordinates.x &&
        event.payload.to.y === this.coordinates.y
      ) {
        this.movingTo = null;
      } else {
        this.movingTo = event.payload.to;
      }
      this.followingShip = null;
    }

    if (
      event.type === 'issueFollowOrder' &&
      event.payload.subjectId === this.id
    ) {
      this.movingTo = null;
      this.followingShip = proxies.shipProxy(event.payload.targetId);
      this.followingPredictive = event.payload.usePredictiveRoute;
    }

    if (event.type === 'moveShip' && event.payload.shipId === this.id) {
      this.movementVector = new Vector(event.payload.to)
        .subtract(this.coordinates)
        .normalize();
      this.coordinates = event.payload.to;

      if (
        this.movingTo?.x === this.coordinates.x &&
        this.movingTo?.y === this.coordinates.y
      ) {
        this.movingTo = null;
      }
    }
  }
}

export type PromisedShip = Ship | Promised<Ship>;
