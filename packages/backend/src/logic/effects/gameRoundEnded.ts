import { GameEvent } from '@prisma/client';
import { logger } from '../../logger';
import { Vector } from '../../util';
import {
  AppEvent,
  changePopulation,
  launchShip,
  moveShip,
  nextRound,
  progressShipConstruction,
} from '../events';
import { proxies } from '../models/proxies';

export async function gameRoundEnded(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'endTurn') {
    logger.info('Effect "gameRoundEnded" triggered');

    const { players, starSystems, ships } = await proxies.gameProxy(
      event.payload.gameId,
    ).$resolve;

    if (players.every((p) => p.turnEnded)) {
      logger.info('All players have ended their turn');

      for (const promisedSystem of starSystems) {
        const system = await promisedSystem.$resolve;

        for (const [idx, planet] of system.habitablePlanets.entries()) {
          if (planet.population) {
            scheduleEvent(
              changePopulation({
                gameId: event.payload.gameId,
                systemId: system.id,
                planetIndex: idx,
                populationChange: Math.round(planet.population * 0.011),
              }),
            );
          }
        }

        let materialsProvided = 100; // TODO calc based on available resources?

        for (const [idx, yard] of system.shipyards.entries()) {
          if (
            yard.workLeft === 0 &&
            yard.materialsLeft === 0 &&
            yard.shipConstructionQueue.length > 0
          ) {
            let workProvided = 100; // TODO calc based on yards / pop?
            for (
              let queueIdx = 0;
              workProvided > 0 && queueIdx < yard.shipConstructionQueue.length;
              queueIdx++
            ) {
              const construction = yard.shipConstructionQueue[queueIdx];
              const workDone = Math.min(construction.workLeft, 100);
              const materialsDelivered =
                materialsProvided > 0
                  ? Math.min(materialsProvided, construction.materialsLeft)
                  : 0;

              workProvided -= workDone;
              materialsProvided -= materialsDelivered;

              if (
                workDone >= construction.workLeft &&
                materialsDelivered >= construction.materialsLeft
              ) {
                scheduleEvent(
                  launchShip({
                    gameId: event.payload.gameId,
                    coordinates: system.coordinates.toCoordinates(),
                    designId: construction.design.id,
                    userId: yard.owner.userId,
                    id: construction.id,
                  }),
                );
              } else {
                scheduleEvent(
                  progressShipConstruction({
                    gameId: event.payload.gameId,
                    systemId: system.id,
                    shipyardIndex: idx,
                    shipId: construction.id,
                    workDone,
                    materialsDelivered,
                  }),
                );
              }
            }
          }
        }
      }

      for (const promisedShip of ships) {
        const ship = await promisedShip.$resolve;

        if (ship.movingTo) {
          const speed = 10; // TODO calc based on ship design

          const movement = new Vector(ship.movingTo).subtract(ship.coordinates);
          const distance = movement.magnitude();

          if (distance > 0) {
            const movementDirection = movement.normalize();
            scheduleEvent(
              moveShip({
                gameId: event.payload.gameId,
                shipId: ship.id,
                to: new Vector(ship.coordinates)
                  .add(movementDirection.multiply(Math.min(speed, distance)))
                  .toCoordinates(),
              }),
            );
          }
        } else if (ship.followingShip) {
          const to = await ship.getFollowingMovingTo();
          if (to) {
            scheduleEvent(
              moveShip({
                gameId: event.payload.gameId,
                shipId: ship.id,
                to,
              }),
            );
          }
        }
      }

      scheduleEvent(
        nextRound({
          gameId: event.payload.gameId,
        }),
      );
    }
  }
}
