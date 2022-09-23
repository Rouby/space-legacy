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
          userId: player.userId,
        }),
      );

      scheduleEvent(
        constructShipyard({
          gameId: event.payload.gameId,
          systemId: system.payload.id,
          userId: player.userId,
          workNeeded: 0,
          materialsNeeded: 0,
        }),
      );

      /**
       * export function generateGalaxyPositions(type: GalaxyType, size: GalaxySize) {
  const systems: { x: number; y: number }[] = [];

  const φ = random.float(0, Math.PI);

  switch (type) {
    case 'elliptical':
      {
        const rngX = random.normal(
          0,
          random.float(count[size] / 20, count[size] / 12),
        );
        const rngY = random.normal(0, count[size] / 8);
        for (let i = 0; i < count[size]; ++i) {
          const x = rngX();
          const y = rngY();
          const tx = x * Math.cos(φ) - y * Math.sin(φ);
          const ty = y * Math.cos(φ) + x * Math.sin(φ);
          systems.push({ x: tx * 10, y: ty * 10 });
        }
      }
      break;
    case 'spiral':
      {
        const n = random.int(2, 4);
        for (let i = 0; i < n; ++i) {
          systems.push(...genArm(φ + ((Math.PI * 2) / n) * i, n));
        }
      }
      break;
  }

  return systems;

  function genArm(φ: number, armCount: number) {
    const points = [];
    const rngX = random.normal(0, 3);
    const rngY = random.normal(0, 3);
    for (let i = 0; i < Math.log10(count[size]) ** 2 * 14; ++i) {
      for (let o = 0; o < 25 / (i + 1) / armCount; ++o) {
        const x = i + rngX();
        const y = rngY();
        const tx =
          x * Math.cos(φ + i ** 1.5 / 100) - y * Math.sin(φ + i ** 1.5 / 100);
        const ty =
          y * Math.cos(φ + i ** 1.5 / 100) + x * Math.sin(φ + i ** 1.5 / 100);
        points.push({ x: tx * 10, y: ty * 10 });
      }
    }
    return points;
  }
}
       */
    }

    return () => {
      pubSub.publish('gameStarted', { id: event.payload.gameId });
    };
  }
}
