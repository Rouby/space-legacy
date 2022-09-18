import { ForbiddenError } from '@casl/ability';
import { hash } from 'bcryptjs';
import { signToken } from '../../../util';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Mutation {
    signup(email: String!, password: String!, name: String!): JWT!
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    signup: async (_, { email, password, name }, { prisma, ability }) => {
      ForbiddenError.from(ability).throwUnlessCan('create', 'User');

      const hashedPassword = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      });

      return signToken(user);
    },
  },
};
