import { GraphQLYogaError } from '@graphql-yoga/node';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { createAbilityFor } from '../../../ability';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Mutation {
    login(email: String!, password: String!, rememberMe: Boolean): JWT!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    login: async (_, { email, password, rememberMe }, { prisma, http }) => {
      const userWithPassword = await prisma.user.findUnique({
        where: { email },
        include: {
          password: true,
        },
      });

      if (!userWithPassword?.password) {
        throw new GraphQLYogaError('Invalid login');
      }

      const isValid = await compare(password, userWithPassword.password.hash);

      if (!isValid) {
        throw new GraphQLYogaError('Invalid login');
      }
      const token = sign(
        {
          space: {
            id: userWithPassword.id,
            permissions: (await createAbilityFor(userWithPassword)).rules,
          },
        },
        process.env.SESSION_SECRET!,
        {
          algorithm: 'HS256',
          subject: userWithPassword.id,
          expiresIn: '1y',
        },
      );

      return token;
    },
  },
};
