import { subject } from '@casl/ability';
import { Resolvers } from '../../generated';

export const typeDefs = /* GraphQL */ `
  type ShipDesign {
    id: ID!
  }

  type Ship {
    id: ID!
    coordinates: Coordinates!
    movingTo: Coordinates
    owner: Player!
  }
`;

export const resolvers: Resolvers = {
  Ship: {
    movingTo: async (ship, _, { ability, models }) => {
      const resolved = ship instanceof models.Ship ? ship : await ship.$resolve;

      if (ability.cannot('view', subject('Ship', resolved), 'movingTo')) {
        return null;
      }

      return ship.movingTo;
    },
  },
};
