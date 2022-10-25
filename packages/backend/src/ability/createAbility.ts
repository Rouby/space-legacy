import { AbilityBuilder, buildMongoQueryMatcher } from '@casl/ability';
import { User } from '@prisma/client';
import { AppAbility } from './AppAbility';

export async function createAbilityFor(user: User) {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility);

  // TODO remove for live
  can('debug', 'Game');

  can('read', 'User', ['id', 'name']);
  can('update', 'User', ['email', 'password', 'name'], { id: user.id });

  can('create', 'Game');
  can('delete', 'Game', { 'players.userId': user.id, players: { $size: 1 } });
  can('join', 'Game', { state: 'CREATED' });
  cannot('join', 'Game', { 'players.userId': user.id });
  can('leave', 'Game', { 'players.userId': user.id });
  can('enter', 'Game', { 'players.userId': user.id });
  can('start', 'Game', { 'creator.id': user.id });
  cannot('start', 'Game', { state: { $ne: 'CREATED' } });

  can('endTurn', 'Game', { 'players.userId': user.id });
  cannot('endTurn', 'Game', {
    players: { $elemMatch: { userId: user.id, turnEnded: true } },
  });

  // const games = await Promise.all(
  //   (await get(proxies.gameListProxy)).list.map((game) => game.$resolve),
  // );
  // for (const game of games.filter((game) =>
  //   game.players.some((player) => player.userId === user.id),
  // )) {
  //   const combats = await Promise.all(
  //     game.combats.map((combat) => combat.$resolve),
  //   );
  //   if (
  //     combats.some((combat) =>
  //       combat.parties.some((party) => party.player.userId === user.id),
  //     )
  //   ) {
  //     cannot('endTurn', 'Game', { id: game.id }).because('Ships are in combat');
  //   }
  // }

  can('constructShip', 'StarSystem', {
    habitablePlanets: { $elemMatch: { 'owner.userId': user.id } },
    shipyards: { $elemMatch: { workLeft: 0, materialsLeft: 0 } },
  });
  cannot('constructShip', 'StarSystem', {
    shipyards: { $size: 0 },
  }).because('No shipyards exist');
  can('cancelShipConstruction', 'StarSystem', {
    habitablePlanets: { $elemMatch: { 'owner.userId': user.id } },
    shipyards: { $elemMatch: { workLeft: 0, materialsLeft: 0 } },
  });
  cannot('cancelShipConstruction', 'StarSystem', {
    shipyards: { $size: 0 },
  });
  cannot('cancelShipConstruction', 'StarSystem', {
    shipyards: { $elemMatch: { shipConstructionQueue: { $size: 0 } } },
  });

  can('move', 'Ship', { 'owner.userId': user.id });
  can('view', 'Ship', ['movingTo'], { 'owner.userId': user.id });

  can('participate', 'Combat', {
    parties: { $elemMatch: { 'player.userId': user.id } },
  });
  can('playCard', 'Combat', {
    parties: { $elemMatch: { 'player.userId': user.id, cardPlayed: null } },
  });

  can('read', 'ShipDesign');
  can('construct', 'ShipDesign', { 'owner.userId': user.id });

  return new AppAbility(
    [...(createDefaultAbility().rules as typeof rules), ...rules],
    { conditionsMatcher: buildMongoQueryMatcher() },
  );
}

export function createDefaultAbility() {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility);

  can('create', 'User');
  can('login', 'User');
  can('read', 'GamesList');

  return new AppAbility(rules);
}
