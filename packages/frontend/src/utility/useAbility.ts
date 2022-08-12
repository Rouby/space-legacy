import { Ability } from '@casl/ability';
import type { AppAbility } from 'backend/src/ability/AppAbility';
import { useToken } from './useToken';

export function useAbility() {
  const [token] = useToken();

  return new Ability(token?.space.permissions, {
    detectSubjectType: (s) => (s as any).__typename,
  }) as AppAbility;
}
