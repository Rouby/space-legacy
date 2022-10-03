import { GameEvent } from '@prisma/client';
import cuid from 'cuid';
import { logger } from '../../logger';
import { roll } from '../../util/roll';
import { AppEvent, damageShip, destroyShip, nextCombatRound } from '../events';
import type { Ship } from '../models';
import { proxies } from '../models/proxies';

export async function combatRoundEnded(
  event: Omit<GameEvent, 'payload'> & AppEvent,
  scheduleEvent: <TEvent extends AppEvent>(event: TEvent) => TEvent,
) {
  if (event.type === 'playCombatCard') {
    logger.info('Effect "combatRoundEnded" triggered');

    const { parties } = await proxies.combatProxy(event.payload.combatId)
      .$resolve;

    if (parties.every((p) => p.cardPlayed)) {
      logger.info('All parties have played their card');

      // roll weapon damage, assign damage to other ships
      // each weapon has initiative, fire on initiative order on top-priority target
      // overdamage is wasted, underdamage is carried over to next round

      for (const party of parties) {
        const weapons = (
          await Promise.all(
            party.ships.map((ship) =>
              ship.$resolve.then((ship) =>
                ship.design.weapons.then((weapons) =>
                  weapons.map((w) => ({ ...w, ship })),
                ),
              ),
            ),
          )
        )
          .flat()
          .reduce((acc, cur) => {
            acc[cur.initiative] = acc[cur.initiative] ?? [];
            acc[cur.initiative].push(cur);
            return acc;
          }, {} as Record<number, { name: string; damage: string; initiative: number; ship: Ship }[]>);

        const ships = await Promise.all(
          party.versus.flatMap((vs) => vs.ships.map((s) => s.$resolve)),
        );

        const targets = ships
          .sort((a, b) => {
            // TODO somehow calculate priority
            return Math.random() - 0.5;
          })
          .map((ship) => ({ ship, damage: ship.damage }));

        for (const initiative of Object.keys(weapons)
          .map((a) => +a)
          .sort((a, b) => b - a)) {
          for (const weapon of weapons[initiative]) {
            const target = targets[0];
            const seed = cuid();
            const { value } = await roll(weapon.damage, seed);
            const damage = +value;

            scheduleEvent(
              damageShip({
                gameId: event.payload.gameId,
                sourceShipId: weapon.ship.id,
                combatId: event.payload.combatId,
                shipId: target.ship.id,
                damage,
                rollSeed: seed,
              }),
            );
            if (
              target.damage + damage >
              (await target.ship.design.structuralHealth)
            ) {
              scheduleEvent(
                destroyShip({
                  gameId: event.payload.gameId,
                  combatId: event.payload.combatId,
                  shipId: target.ship.id,
                }),
              );
              targets.shift();
            }
          }
        }
      }

      scheduleEvent(
        nextCombatRound({
          gameId: event.payload.gameId,
          combatId: event.payload.combatId,
        }),
      );
    }
  }
}
