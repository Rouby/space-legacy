import { AbilityBuilder } from '@casl/ability';
import { User } from '@prisma/client';
import { AppAbility } from './AppAbility';

export async function createAbilityFor(user: User) {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility);

  can('read', 'User', ['id', 'name']);
  can('update', 'User', ['email', 'password', 'name'], { id: user.id });

  can('create', 'Game');
  can('delete', 'Game', { 'players.id': user.id, players: { $size: 1 } });
  can('join', 'Game', { state: 'CREATED' });
  cannot('join', 'Game', { 'players.id': user.id });
  can('leave', 'Game', { 'players.id': user.id });
  can('enter', 'Game', { 'players.id': user.id });
  can('start', 'Game', { 'creator.id': user.id });
  cannot('start', 'Game', { state: { $ne: 'CREATED' } });

  can('endTurn', 'Game', { 'players.id': user.id });
  cannot('endTurn', 'Game', {
    players: { $elemMatch: { id: user.id, turnEnded: true } },
  });

  can('view', 'StarSystem', { 'habitablePlanets.owner.id': user.id });

  return new AppAbility([
    ...(createDefaultAbility().rules as typeof rules),
    ...rules,
  ]);
}

export function createDefaultAbility() {
  const { can, cannot, rules } = new AbilityBuilder(AppAbility);

  can('create', 'User');
  can('login', 'User');
  can('read', 'GamesList');

  return new AppAbility(rules);
}
