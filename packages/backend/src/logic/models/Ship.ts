import type { GameEvent } from '@prisma/client';
import { getDbClient, Line, Vector } from '../../util';
import type { AppEvent } from '../events';
import type { Combat } from './Combat';
import { Promised, proxies } from './proxies';
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
  public design = proxies.shipDesignProxy('');
  public name = '';
  public starSystem = null as Promised<StarSystem> | null;
  public coordinates = new Vector();
  public previousCoordinates = new Vector();
  public movingTo = null as Vector | null;
  public followingShip = null as Promised<Ship> | null;
  public followingPredictive = false;
  public movementVector = null as Vector | null;
  public combat = null as Promised<Combat> | null;
  public damage = 0;

  public async isVisibleTo(userId: string) {
    const visibility = await proxies.visibilityProxy(this.game.id, userId)
      .$resolve;

    return (
      (await visibility.checkVisibility(this.coordinates)) ||
      (await visibility.checkVisibility(this.previousCoordinates))
    );
  }

  public async getFollowingMovingTo() {
    if (this.followingShip) {
      const followingShip = await this.followingShip.$resolve;

      if (
        this.followingPredictive &&
        followingShip.followingShip?.id !== this.id
        // if both ships follow each other,
        // just move to the coordinates the other ship is currently at
      ) {
        const followingShipMovement =
          followingShip.movementVector?.multiply(10) ?? new Vector(); // TODO get ship speed?
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

  public async getMovementLine() {
    const targetVector = this.followingShip
      ? await this.getFollowingMovingTo()
      : this.movingTo;

    if (!targetVector) {
      return null;
    }

    const speed = 10; // TODO calc based on design

    const movement = targetVector.subtract(this.coordinates);
    const distance = movement.magnitude();

    return new Line(
      this.coordinates,
      this.coordinates.add(
        movement.normalize().multiply(Math.min(speed, distance)),
      ),
    );
  }

  private applyEvent(event: AppEvent) {
    if (event.type === 'launchShip' && event.payload.id === this.id) {
      this.game = proxies.gameProxy(event.payload.gameId);
      this.owner = proxies.playerProxy(
        event.payload.gameId,
        event.payload.userId,
      );
      this.design = proxies.shipDesignProxy(event.payload.designId);
      this.coordinates = new Vector(event.payload.coordinates);
      this.previousCoordinates = this.coordinates;
    }

    if (
      event.type === 'issueMoveOrder' &&
      event.payload.subjectId === this.id
    ) {
      if (this.coordinates.equals(event.payload.to)) {
        this.movingTo = null;
      } else {
        this.movingTo = new Vector(event.payload.to);
      }
      this.movementVector = null;
      this.followingShip = null;
    }

    if (
      event.type === 'issueFollowOrder' &&
      event.payload.subjectId === this.id
    ) {
      this.movingTo = null;
      this.movementVector = null;
      this.followingShip = proxies.shipProxy(event.payload.targetId);
      this.followingPredictive = event.payload.usePredictiveRoute;
    }

    if (event.type === 'moveShip' && event.payload.shipId === this.id) {
      this.movementVector = new Vector(event.payload.to)
        .subtract(this.coordinates)
        .normalize();
      this.previousCoordinates = this.coordinates;
      this.coordinates = new Vector(event.payload.to);

      if (this.movingTo?.equals(this.coordinates)) {
        this.movingTo = null;
        this.movementVector = null;
      }
    }

    if (
      event.type === 'engageCombat' &&
      event.payload.parties.some((party) => party.shipIds.includes(this.id))
    ) {
      this.combat = proxies.combatProxy(event.payload.id);
    }

    if (event.type === 'damageShip' && event.payload.shipId === this.id) {
      this.damage += event.payload.damage;
    }

    if (
      event.type === 'endCombat' &&
      event.payload.combatId === this.combat?.id
    ) {
      this.combat = null;
    }
  }
}

export type PromisedShip = Ship | Promised<Ship>;
