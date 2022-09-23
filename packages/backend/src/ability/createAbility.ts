import { AbilityBuilder, buildMongoQueryMatcher } from '@casl/ability';
import { User } from '@prisma/client';
import { proxies } from '../logic/models/proxies';
import { AppAbility } from './AppAbility';

export async function createAbilityFor(user: User) {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility);

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

  const games = await Promise.all(
    (await proxies.gameListProxy.get()).list.map((game) => game.$resolve),
  );
  for (const game of games.filter((game) =>
    game.players.some((player) => player.userId === user.id),
  )) {
    const combats = await game.getActiveCombats();
    console.log(combats);
    if (combats.some((combat) => combat.userId === user.id)) {
      cannot('endTurn', 'Game', { id: game.id }).because('Ships are in combat');
    }
  }

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
