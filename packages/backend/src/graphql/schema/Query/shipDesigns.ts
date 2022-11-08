import { ForbiddenError } from '@casl/ability';
import { getInstance } from '@rouby/event-sourcing';
import { Player, ShipDesign } from '../../../logic/models';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type ShipDesign {
    id: ID!
    name: String!
    structuralHealth: Int!
    owner: Player!
    components: [ShipComponent!]!
  }

  type Query {
    shipDesign(id: ID!, gameId: ID!): ShipDesign
    shipDesigns(gameId: ID!): [ShipDesign!]!
  }
`;

export const resolvers: Resolvers = {
  Query: {
    shipDesign: async (_, { gameId, id }, { ability, userId }) => {
      const shipDesign = await getInstance(ShipDesign, id);

      ForbiddenError.from(ability).throwUnlessCan('read', shipDesign);

      return shipDesign;
    },
    shipDesigns: async (_, { gameId }, { userId }) => {
      const designs = (await getInstance(Player, gameId, userId))
        .availableShipDesigns;

      return designs;
    },
  },
};
