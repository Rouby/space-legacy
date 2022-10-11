import { GameEvent } from '@prisma/client';
import { logger } from '../../logger';
import {
  AppEvent,
  changePopulation,
  launchShip,
  nextRound,
  progressShipConstruction,
} from '../events';
import { proxies } from '../models/proxies';
import { moveShips } from './util/shipMovement';

export async function gameRoundEnded(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'endTurn') {
    logger.info('Effect "gameRoundEnded" triggered');

    const {
      players: promisedPlayers,
      starSystems,
      ships,
    } = await proxies.gameProxy(event.payload.gameId).$resolve;

    const players = await promisedPlayers.$resolveAll;

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

      await moveShips(await ships.$resolveAll, event, scheduleEvent);

      scheduleEvent(
        nextRound({
          gameId: event.payload.gameId,
        }),
      );
    }
  }
}
