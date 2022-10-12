import { GameEvent } from '@prisma/client';
import { Vector } from '../../../util';
import { AppEvent, moveShip, type endTurn } from '../../events';
import type { Ship } from '../../models';

export async function moveShips(
  ships: Ship[],
  event: Omit<GameEvent, 'payload'> & ReturnType<typeof endTurn>,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  const shipsToMove = [...ships];

  // 1st pass: find ships that cross paths
  for (const ship of shipsToMove) {
    const movementLine = await ship.getMovementLine();

    if (!movementLine) {
      continue;
    }

    for (const otherShip of shipsToMove) {
      if (otherShip.id === ship.id) {
        continue;
      }

      const otherMovementLine = await otherShip.getMovementLine();

      if (!otherMovementLine) {
        continue;
      }

      const params = { alpha: 0, beta: 0 };
      const intersection = movementLine
        .intersection(otherMovementLine, params)
        ?.round();

      if (
        intersection &&
        Math.abs(params.alpha - params.beta) < 0.05 &&
        (await ship.owner.relationships.then(
          (relationships) =>
            relationships[otherShip.owner.userId] !== 'friendly',
        ))
      ) {
        scheduleEvent(
          moveShip({
            gameId: event.payload.gameId,
            shipId: ship.id,
            to: intersection,
          }),
        );
        scheduleEvent(
          moveShip({
            gameId: event.payload.gameId,
            shipId: otherShip.id,
            to: intersection,
          }),
        );
        shipsToMove.splice(shipsToMove.indexOf(ship), 1);
        shipsToMove.splice(shipsToMove.indexOf(otherShip), 1);
      }
    }
  }

  // 2nd pass: move all remaining ships
  for (const ship of shipsToMove) {
    const targetVector = ship.followingShip
      ? await ship.getFollowingMovingTo()
      : ship.movingTo;

    if (targetVector) {
      const speed = 10; // TODO calc based on ship design

      const movement = new Vector(targetVector).subtract(ship.coordinates);
      const distance = movement.magnitude();

      if (distance > 0) {
        scheduleEvent(
          moveShip({
            gameId: event.payload.gameId,
            shipId: ship.id,
            to: new Vector(ship.coordinates)
              .add(movement.normalize().multiply(Math.min(speed, distance)))
              .toCoordinates(),
          }),
        );
      }
    }
  }
}
