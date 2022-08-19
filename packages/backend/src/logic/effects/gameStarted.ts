import { GameEvent } from '@prisma/client';
import { publishEvent, retrieveState } from '..';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import { AppEvent, colonizePlanet, createStarSystem } from '../events';

export async function gameStarted(
  event: Omit<GameEvent, 'payload'> & AppEvent,
) {
  if (event.type === 'startGame') {
    logger.info('Effect "gameStarted" triggered');

    const system = await publishEvent({
      event: createStarSystem({
        gameId: event.payload.gameId,
        name: 'System One',
        coordinates: { x: 0, y: 0 },
        habitablePlanets: [
          {
            name: 'Planet One',
            size: 25,
            type: 'continental',
          },
        ],
      }),
      trigger: event,
    });

    {
      const userId = (await retrieveState('games')).list.find(
        (g) => g.id === event.payload.gameId,
      )!.players[0].id;

      await publishEvent({
        event: colonizePlanet({
          gameId: event.payload.gameId,
          systemId: system.id,
          planetIndex: 0,
          userId,
        }),
        trigger: event,
      });
    }

    pubSub.publish('gameStarted', { id: event.payload.gameId });
  }
}
