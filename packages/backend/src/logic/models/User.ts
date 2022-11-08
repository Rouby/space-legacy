import { User } from '@prisma/client';
import { registerModel } from '@rouby/event-sourcing';
import { getDbClient } from '../../util';

declare module '@rouby/event-sourcing' {
  interface RegisteredModels {
    User: User;
  }
}

registerModel('User', (id) =>
  getDbClient().then((db) => db.user.findUnique({ where: { id } })),
);
