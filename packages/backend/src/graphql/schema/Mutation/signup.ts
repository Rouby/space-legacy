import { User } from '@prisma/client';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { createAbilityFor } from '../../../ability';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Mutation {
    signup(email: String!, password: String!): JWT!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    signup: async (_, { email, password }, { prisma, http }) => {
      const hashedPassword = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name: 'new user',
          email,
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      });

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
        },
      );

      return token;
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
