import { GameEvent } from '@prisma/client';
import { pubSub } from '../../graphql/context';
import { logger } from '../../logger';
import { Vector } from '../../util';
import { AppEvent, engageCombat } from '../events';
import type { Ship } from '../models';
import { proxies } from '../models/proxies';

export async function gameRoundStarted(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'nextRound') {
    logger.info('Effect "gameRoundStarted" triggered');

    const game = await proxies.gameProxy(event.payload.gameId).$resolve;

    const shipsByPosition = await Promise.all(
      game.ships.map((ship) => ship.$resolve),
    ).then((ships) =>
      ships.reduce((acc, ship) => {
        const key = ship.coordinates.toString();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(ship);
        return acc;
      }, {} as { [key: string]: Ship[] }),
    );
    const combats = await Promise.all(
      Object.entries(shipsByPosition)
        .filter(([, ships]) => ships.length > 1)
        .map(async ([position, ships]) => {
          const shipsByUser = ships.reduce((acc, ship) => {
            if (!acc[ship.owner.userId]) {
              acc[ship.owner.userId] = [];
            }
            acc[ship.owner.userId].push(ship);
            return acc;
          }, {} as { [userId: string]: Ship[] });
          const userIds = Object.keys(shipsByUser);

          const coordinates = Vector.fromString(position);
          const players = await Promise.all(
            game.players.map((player) => player.$resolve),
          );

          return {
            coordinates,
            parties: Object.entries(shipsByUser).map(([userId, ships]) => {
              const relationships = players.find(
                (p) => p.userId === userId,
              )?.relationships;
              return {
                player: proxies.playerProxy(game.id, userId),
                ships,
                versus: userIds
                  .filter(
                    (otherUserId) => relationships?.[otherUserId] === 'hostile',
                  )
                  .map((userId) => ({
                    player: proxies.playerProxy(game.id, userId),
                    ships: shipsByUser[userId],
                  })),
              };
            }),
          };
        }),
    );
    for (const combat of combats) {
      // TODO check if combat is ongoing, then just event joinCombat
      scheduleEvent(
        engageCombat({
          gameId: game.id,
          coordinates: combat.coordinates.toCoordinates(),
          parties: combat.parties.map((party) => ({
            userId: party.player.userId,
            shipIds: party.ships.map((ship) => ship.id),
            versus: party.versus.map((otherParty) => ({
              userId: otherParty.player.userId,
              shipIds: otherParty.ships.map((ship) => ship.id),
            })),
            cardIdsInHand: ['Attack', 'Defend'],
            cardIdsInDeck: ['DirectHit'],
          })),
        }),
      );
    }

    return () => {
      pubSub.publish('gameNextRound', { id: event.payload.gameId });
    };
  }
}
