import { Ability } from '@casl/ability';
import { createDefaultAbility } from 'backend/src/ability';
// import type { AppAbility } from 'backend/src/ability/AppAbility';
import { useMemo } from 'react';
import { useToken } from './useToken';

export function useAbility() {
  const [token] = useToken();

  return useMemo(
    () =>
      token
        ? new Ability(token?.space.permissions, {
            detectSubjectType: (s) => (s as any).__typename,
          })
        : createDefaultAbility(),
    [token],
  );
}
