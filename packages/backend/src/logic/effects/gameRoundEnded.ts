import { GameEvent } from '@prisma/client';
import { publishEvent } from '..';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import { AppEvent, changePopulation, nextRound } from '../events';
import { Game } from '../models';

export async function gameRoundEnded(
  event: Omit<GameEvent, 'payload'> & AppEvent,
) {
  if (event.type === 'endTurn') {
    logger.info('Effect "gameRoundEnded" triggered');

    const { players, starSystems } = await Game.get(event.payload.gameId);

    if (players.every((p) => p.turnEnded)) {
      logger.info('All players have ended their turn');

      for (const system of starSystems) {
        for (const [idx, planet] of (await system.habitablePlanets).entries()) {
          if (planet.population) {
            await publishEvent({
              event: changePopulation({
                gameId: event.payload.gameId,
                systemId: system.id,
                planetIndex: idx,
                populationChange: Math.round(planet.population * 0.011),
              }),
              trigger: event,
            });
          }
        }
      }

      await publishEvent({
        event: nextRound({
          gameId: event.payload.gameId,
        }),
        trigger: event,
      });

      pubSub.publish('gameNextRound', { id: event.payload.gameId });
    }
  }
}
