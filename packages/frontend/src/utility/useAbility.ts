import { Ability } from '@casl/ability';
import { createDefaultAbility } from 'backend/src/ability';
import type { AppAbility } from 'backend/src/ability/AppAbility';
import { useToken } from './useToken';

export function useAbility() {
  const [token] = useToken();

  if (!token) {
    return createDefaultAbility();
  }
  return new Ability(token?.space.permissions, {
    detectSubjectType: (s) => (s as any).__typename,
  }) as any as AppAbility;
}
