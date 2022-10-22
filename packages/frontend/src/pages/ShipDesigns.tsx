import { Button, Group, Select } from '@mantine/core';
import { Link, Outlet } from '@tanstack/react-location';
import { useState } from 'react';
import { useAvailableShipDesignsQuery } from '../graphql';
import { useGame } from '../utility';

export function ShipDesigns() {
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query availableShipDesigns($gameId: ID!) {
      shipDesigns(gameId: $gameId) {
        __typename
        id
        name
        owner {
          id
          userId
        }
      }
    } 
  `;
  const [availableShipDesigns] = useAvailableShipDesignsQuery({
    variables: { gameId: game?.id! },
  });
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

  return (
    <>
      <Group>
        <Select
          data={
            availableShipDesigns.data?.shipDesigns.map((design) => ({
              value: design.id,
              label: design.name,
            })) ?? []
          }
          value={
            availableShipDesigns.data?.shipDesigns.find(
              (design) => design.id === selectedDesignId,
            )?.id
          }
          onChange={(id) => setSelectedDesignId(id)}
        />
        <Button component={Link} to="new">
          Create new design
        </Button>
      </Group>

      <Outlet />
    </>
  );
}
