import { ForbiddenError } from '@casl/ability';
import { GraphQLYogaError } from '@graphql-yoga/common';
import { getInstance, publishEvent } from '@rouby/event-sourcing';
import { cancelShipConstruction } from '../../../logic/events';
import { StarSystem } from '../../../logic/models';
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

export const resolvers: Resolvers = {
  Mutation: {
    cancelShipConstruction: async (
      _,
      { input: { gameId, systemId, shipyardIndex, queueIndex } },
      { ability },
    ) => {
      const starSystem = await getInstance(StarSystem, systemId);
      if (!starSystem) {
        throw new GraphQLYogaError('Star system not found');
      }

      ForbiddenError.from(ability).throwUnlessCan(
        'cancelShipConstruction',
        starSystem,
      );

      const construction = (await getInstance(StarSystem, systemId)).shipyards[
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
