import { getDbClient } from '../../../util';
import { proxyOf } from './proxy';

export function userProxy(id: string) {
  return proxyOf({ id }, () =>
    getDbClient().then((prisma) => prisma.user.findUnique({ where: { id } })),
  );
}
export type userProxy = typeof userProxy;
