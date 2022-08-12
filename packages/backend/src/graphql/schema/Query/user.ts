import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    user: User
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    user: (_, __, { prisma, userId }) =>
      userId ? prisma.user.findUnique({ where: { id: userId } }) : null,
  },
};
