import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { getInstance } from '@rouby/event-sourcing';
import { issueMoveOrder } from '../../../logic/events';
import { Ship } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input MoveShipInput {
    gameId: ID!
    shipId: ID!
    to: Coordinates!
  }

  type Mutation {
    moveShip(input: MoveShipInput!): Ship
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    moveShip: async (
      _,
      { input: { gameId, shipId, to } },
      { publishEvent, ability },
    ) => {
      const ship = await getInstance(Ship, shipId);

      if (!ship) {
        throw new GraphQLYogaError('Star system not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('move', ship);

      await publishEvent({
        event: issueMoveOrder({
          gameId,
          subjectId: shipId,
          to,
        }),
      });

      return await getInstance(Ship, shipId);
    },
  },
};
