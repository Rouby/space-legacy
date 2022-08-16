import { User } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { createAbilityFor } from '../ability';

export type TokenInfo = Awaited<ReturnType<typeof createPayload>>;

export async function signToken(user: User) {
  return sign(await createPayload(user), process.env.SESSION_SECRET!, {
    algorithm: 'HS256',
    subject: user.id,
    expiresIn: '1y',
  });
}

async function createPayload(user: User) {
  return {
    space: {
      id: user.id,
      name: user.name,
      permissions: (await createAbilityFor(user)).rules,
    },
  };
}
