import { GraphQLYogaError } from '@graphql-yoga/node';
import { context } from '../../context';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type Fleet {
    id: ID!
    name: String!
    coordinates: Coordinates!
    system: StarSystem
    composition: FleetComposition!
    mustering: FleetMustering!
  }

  type FleetComposition {
    squadrons: [FleetSquadron!]!
  }

  type FleetSquadron {
    shipId: ID!
    quantity: Int!
  }

  type FleetMustering {
    squadrons: [FleetSquadronMustering!]!
  }

  type FleetSquadronMustering {
    shipId: ID!
    quantity: Int!
    workLeft: Int!
    materialNeeded: Int!
  }

  input FleetFilterInput {
    gameId: IDFilterInput
    systemId: IDFilterInput

    and: [FleetFilterInput!]
    or: [FleetFilterInput!]
  }

  type Query {
    fleets(gameId: ID!, filter: FleetFilterInput): [Fleet!]!
  }
`;

export const resolvers: Resolvers<Awaited<ReturnType<typeof context>>> = {
  Query: {
    fleets: async (_, { gameId, filter }, { ability, models }) => {
      const game = await models.Game.get(gameId);

      if (!game) {
        throw new GraphQLYogaError('Unauthorized');
      }

      return game.fleets;
    },
  },
};
