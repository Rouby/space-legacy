import { signToken } from '../../../util';
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

      return signToken(user);
    },
  },
};
