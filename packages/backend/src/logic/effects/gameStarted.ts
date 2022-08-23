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
        sunClass: 'F',
        coordinates: { x: 0, y: 0 },
        habitablePlanets: [
          {
            orbit: 0.1,
            size: 25,
            type: 'continental',
          },
          {
            orbit: 0.3,
            size: 5,
            type: 'continental',
          },
        ],
        uninhabitableBodies: [
          {
            orbit: 0.2,
            size: 40,
            type: 'gas',
          },
          {
            orbit: 0.4,
            size: 24,
            type: 'broken',
          },
          {
            orbit: 0.5,
            size: 20,
            type: 'asteroids',
          },
          {
            orbit: 0.6,
            size: 40,
            type: 'frozen',
          },
          {
            orbit: 0.7,
            size: 40,
            type: 'gas',
          },
          {
            orbit: 0.8,
            size: 40,
            type: 'gas',
          },
          {
            orbit: 0.9,
            size: 14,
            type: 'toxic',
          },
          {
            orbit: 1,
            size: 12,
            type: 'frozen',
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
