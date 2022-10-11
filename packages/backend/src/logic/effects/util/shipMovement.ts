import { GameEvent } from '@prisma/client';
import { Vector } from '../../../util';
import { AppEvent, moveShip, type endTurn } from '../../events';
import type { Ship } from '../../models';

export async function moveShips(
  ships: Ship[],
  event: Omit<GameEvent, 'payload'> & ReturnType<typeof endTurn>,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  for (const ship of ships) {
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
