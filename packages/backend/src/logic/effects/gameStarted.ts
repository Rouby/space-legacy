import { GameEvent } from '@prisma/client';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import {
  AppEvent,
  colonizePlanet,
  constructShipyard,
  createStarSystem,
} from '../events';
import { Game } from '../models';

export async function gameStarted(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'startGame') {
    logger.info('Effect "gameStarted" triggered');

    const game = await Game.get(event.payload.gameId);

    for (const [idx, player] of game.players.entries()) {
      const system = scheduleEvent(
        createStarSystem({
          gameId: event.payload.gameId,
          name: 'Home System',
          sunClass: 'F',
          coordinates: {
            x: Math.round(
              Math.cos(Math.PI * 2 * (idx / game.players.length)) * 100,
            ),
            y: Math.round(
              Math.sin(Math.PI * 2 * (idx / game.players.length)) * 100,
            ),
          },
          habitablePlanets: [
            { orbit: 0.1, size: 25, type: 'continental' },
            { orbit: 0.3, size: 5, type: 'continental' },
          ],
          uninhabitableBodies: [
            { orbit: 0.2, size: 40, type: 'gas' },
            { orbit: 0.4, size: 24, type: 'broken' },
            { orbit: 0.5, size: 20, type: 'asteroids' },
            { orbit: 0.6, size: 40, type: 'frozen' },
            { orbit: 0.7, size: 40, type: 'gas' },
            { orbit: 0.8, size: 40, type: 'gas' },
            { orbit: 0.9, size: 14, type: 'toxic' },
            { orbit: 1.0, size: 12, type: 'frozen' },
          ],
        }),
      );

      scheduleEvent(
        colonizePlanet({
          gameId: event.payload.gameId,
          systemId: system.payload.id,
          planetIndex: 0,
          userId: player.id,
        }),
      );

      scheduleEvent(
        constructShipyard({
          gameId: event.payload.gameId,
          systemId: system.payload.id,
          userId: player.id,
          workNeeded: 0,
          materialsNeeded: 0,
        }),
      );
    }

    return () => {
      pubSub.publish('gameStarted', { id: event.payload.gameId });
    };
  }
}
