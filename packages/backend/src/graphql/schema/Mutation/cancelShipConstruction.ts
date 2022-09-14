import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/common';
import { cancelShipConstruction } from '../../../logic/events';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  input CancelShipConstructionInput {
    gameId: ID!
    systemId: ID!
    shipyardIndex: Int!
    queueIndex: Int!
  }

  type Mutation {
    cancelShipConstruction(
      input: CancelShipConstructionInput!
    ): ShipConstruction
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Mutation: {
    cancelShipConstruction: async (
      _,
      { input: { gameId, systemId, shipyardIndex, queueIndex } },
      { publishEvent, ability, models, userId },
    ) => {
      const starSystem = await models.StarSystem.get(systemId);
      if (!starSystem) {
        throw new GraphQLYogaError('Star system not found');
      }

      ForbiddenError.from(ability).throwUnlessCan(
        'cancelShipConstruction',
        starSystem,
      );

      const construction = (await models.StarSystem.get(systemId)).shipyards[
        shipyardIndex
      ].shipConstructionQueue.slice(-1)[0];

      await publishEvent({
        event: cancelShipConstruction({
          gameId,
          systemId,
          shipyardIndex,
          queueIndex,
        }),
      });

      return construction;
    },
  },
};
