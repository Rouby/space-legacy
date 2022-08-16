import { GraphQLYogaError } from '@graphql-yoga/node';
import { User } from '@prisma/client';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { createAbilityFor } from '../../../ability';
import { signToken } from '../../../util';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Mutation {
    signup(email: String!, password: String!, name: String!): JWT!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    signup: async (_, { email, password, name }, { prisma, ability }) => {
      if (ability.cannot('create', 'User')) {
        throw new GraphQLYogaError('Unauthorized');
      }

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

async function jwtForUser(user: User) {
  const permissions = createAbilityFor(user);

  return sign(
    { space: { id: user.id, permissions } },
    process.env.SESSION_SECRET!,
    {
      algorithm: 'HS256',
      subject: user.id,
      expiresIn: '7d',
    },
  );
}
