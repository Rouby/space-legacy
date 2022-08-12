import { sign } from 'jsonwebtoken';
import { createAbilityFor } from '../../../ability';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    token: JWT
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    token: async (_, __, { prisma, userId }) => {
      const user = userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : null;

      if (!user) {
        return null;
      }

      const token = sign(
        {
          space: {
            id: user.id,
            permissions: (await createAbilityFor(user)).rules,
          },
        },
        process.env.SESSION_SECRET!,
        {
          algorithm: 'HS256',
          subject: user.id,
          expiresIn: '1y',
        },
      );

      return token;
    },
  },
};
