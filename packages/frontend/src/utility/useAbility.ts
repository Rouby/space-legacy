import { Ability } from '@casl/ability';
import { useMemo } from 'react';
import { useToken } from './useToken';

export function useAbility() {
  const [token] = useToken();

  return useMemo(
    () =>
      token
        ? new Ability(token?.space.permissions, {
            detectSubjectType: (s) => s.__typename ?? s.__caslSubjectType__,
          })
        : new Ability(),
    [token],
  );
}
