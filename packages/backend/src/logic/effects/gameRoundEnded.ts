import { GameEvent } from '@prisma/client';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import {
  AppEvent,
  changePopulation,
  launchShip,
  nextRound,
  progressShipConstruction,
} from '../events';
import { Game } from '../models';

export async function gameRoundEnded(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'endTurn') {
    logger.info('Effect "gameRoundEnded" triggered');

    const { players, starSystems, fleets } = await Game.get(
      event.payload.gameId,
    );

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
                    systemId: system.id,
                    designId: construction.design.id,
                    userId: yard.owner.id,
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

      scheduleEvent(
        nextRound({
          gameId: event.payload.gameId,
        }),
      );

      return () => {
        pubSub.publish('gameNextRound', { id: event.payload.gameId });
      };
    }
  }
}
