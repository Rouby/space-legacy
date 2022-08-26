import { User } from '@prisma/client';
import type { Promised } from '.';
import { getDbClient } from '../../../util';

export function userProxy(id: string) {
  return new Proxy<Promised<User>>({ id } as any, {
    get: (target, prop: keyof User) => {
      if (prop in target) {
        return target[prop];
      }
      return getDbClient().then((prisma) =>
        prisma.user
          .findUnique({ where: { id: target.id } })
          .then((user) => user?.[prop]),
      );
    },
  });
}
