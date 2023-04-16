import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { getInstance, publishEvent } from '@rouby/event-sourcing';
import { issueFollowOrder } from '../../../logic/events';
import { Ship } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input FollowShipInput {
    gameId: ID!
    shipId: ID!
    shipToFollowId: ID!
    predictRoute: Boolean
  }

  type Mutation {
    followShip(input: FollowShipInput!): Ship
  }
`;

export const resolvers: Resolvers = {
  Mutation: {
    followShip: async (
      _,
      { input: { gameId, shipId, shipToFollowId, predictRoute } },
      { ability, userId },
    ) => {
      const ship = await getInstance(Ship, shipId);

      if (!ship) {
        throw new GraphQLYogaError('Star system not found');
      }

      ForbiddenError.from(ability).throwUnlessCan('move', ship);

      const shipToFollow = await getInstance(Ship, shipToFollowId);

      if (!(await shipToFollow.isVisibleTo(userId))) {
        throw new GraphQLYogaError('Ship to follow not found');
      }

      await publishEvent({
        event: issueFollowOrder({
          gameId,
          subjectId: shipId,
          targetId: shipToFollowId,
          usePredictiveRoute: !!predictRoute,
        }),
      });

      return await getInstance(Ship, shipId);
    },
  },
};
