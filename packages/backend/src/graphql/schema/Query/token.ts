import { signToken } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Query {
    token: JWT
  }
`;

export const resolvers: Resolvers = {
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
