import { ForbiddenError, subject } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { compare } from 'bcryptjs';
import { signToken } from '../../../util';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Mutation {
    login(email: String!, password: String!, rememberMe: Boolean): JWT!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    login: async (_, { email, password, rememberMe }, { prisma, ability }) => {
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

      ForbiddenError.from(ability).throwUnlessCan(
        'login',
        subject('User', userWithPassword),
      );

      return signToken(userWithPassword);
    },
  },
};
