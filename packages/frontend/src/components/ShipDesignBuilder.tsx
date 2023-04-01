import {
  ActionIcon,
  Avatar,
  Box,
  Center,
  Group,
  Paper,
  RingProgress,
  SimpleGrid,
  Text,
} from '@mantine/core';
import {
  IconBolt,
  IconHeartbeat,
  IconMinus,
  IconPlus,
  IconUsers,
} from '@tabler/icons';
import { useMatch } from '@tanstack/react-location';
import { useState } from 'react';
import {
  AvailableShipComponentsQuery,
  useAvailableShipComponentsQuery,
  useShipDesignDetailsQuery,
} from '../graphql';
import { useGame } from '../utility';

export function ShipDesignBuilder() {
  const {
    params: { id },
  } = useMatch();
  const [game] = useGame();

  /* GraphQL */ `#graphql
    query shipDesignDetails($gameId: ID!, $shipDesignId: ID!) {
      shipDesign(gameId: $gameId, id: $shipDesignId) {
        __typename
        id
        name
        owner {
          id
          userId
        }
        components {
          id
          name
          powerDraw
          crewRequirements
          structuralStrength
          resourceCosts

          ... on FTLShipComponent {
            ftlSpeed
            fuelConsumption
          }

          ... on GeneratorShipComponent {
            powerGeneration
          }

          ... on AugmentationShipComponent {
            lifeSupport
            crewCapacity
            soldierCapacity
          }
        }
      }
    } 
  `;
  const [shipDesign] = useShipDesignDetailsQuery({
    variables: { gameId: game?.id!, shipDesignId: id! },
    pause: !id,
  });

  /* GraphQL */ `#graphql
    query availableShipComponents($gameId: ID!) {
      shipComponents(gameId: $gameId) {
        __typename
        id
        name
        powerDraw
        crewRequirements
        structuralStrength
        resourceCosts
        
        ... on FTLShipComponent {
          ftlSpeed
          fuelConsumption
        }

        ... on GeneratorShipComponent {
          powerGeneration
        }

        ... on AugmentationShipComponent {
          lifeSupport
          crewCapacity
          soldierCapacity
        }
      }
    } 
  `;
  const [availableShipComponents] = useAvailableShipComponentsQuery({
    variables: { gameId: game?.id! },
  });

  const [newComponents, setNewComponents] = useState<
    AvailableShipComponentsQuery['shipComponents']
  >([]);

  const powerDraw = (shipDesign.data?.shipDesign?.components ?? newComponents)
    .map((comp) => comp.powerDraw)
    .reduce((a, b) => a + b, 0);
  const powerGeneration = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) =>
      comp.__typename === 'GeneratorShipComponent' ? comp.powerGeneration : 0,
    )
    .reduce((a, b) => a + b, 0);

  const crewRequirements = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) => comp.crewRequirements)
    .reduce((a, b) => a + b, 0);
  const crewCapacity = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) =>
      comp.__typename === 'AugmentationShipComponent'
        ? comp.crewCapacity ?? 0
        : 0,
    )
    .reduce((a, b) => a + b, 0);

  const lifeSupportRequired = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map(
      (comp) =>
        comp.crewRequirements +
        (comp.__typename === 'AugmentationShipComponent'
          ? comp.soldierCapacity ?? 0
          : 0),
    )
    .reduce((a, b) => a + b, 0);
  const lifeSupportProvided = (
    shipDesign.data?.shipDesign?.components ?? newComponents
  )
    .map((comp) =>
      comp.__typename === 'AugmentationShipComponent'
        ? comp.lifeSupport ?? 0
        : 0,
    )
    .reduce((a, b) => a + b, 0);

  return (
    <>
      build me up {id} {availableShipComponents.data?.shipComponents.length}
      {availableShipComponents.data?.shipComponents.map((component) => (
        <div key={component.id}>
          <ShipComponent
            name={component.name}
            powerDraw={component.powerDraw}
            crewRequirements={component.crewRequirements}
            powerGeneration={
              component.__typename === 'GeneratorShipComponent'
                ? component.powerGeneration
                : undefined
            }
            crewCapacity={
              component.__typename === 'AugmentationShipComponent'
                ? component.crewCapacity
                : undefined
            }
            lifeSupport={
              component.__typename === 'AugmentationShipComponent'
                ? component.lifeSupport
                : undefined
            }
            onClick={() =>
              setNewComponents((components) => [...components, component])
            }
          />
        </div>
      ))}
      <SimpleGrid cols={5}>
        <Paper withBorder radius="md" p="xs">
          <Group>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[
                {
                  color: 'green',
                  value: Math.max(0, powerGeneration - powerDraw),
                },
                {
                  color: 'red',
                  value: Math.max(0, powerDraw - powerGeneration),
                },
              ]}
              label={
                <Center>
                  <IconBolt size={22} stroke={1.5} />
                </Center>
              }
            />

            <div>
              <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                Power
              </Text>
              <Text weight={700} size="xl">
                {powerGeneration - powerDraw}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder radius="md" p="xs">
          <Group>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[
                {
                  color: 'green',
                  value: Math.max(0, crewCapacity - crewRequirements),
                },
                {
                  color: 'red',
                  value: Math.max(0, crewRequirements - crewCapacity),
                },
              ]}
              label={
                <Center>
                  <IconUsers size={22} stroke={1.5} />
                </Center>
              }
            />

            <div>
              <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                Crew Capacity
              </Text>
              <Text weight={700} size="xl">
                {crewCapacity - crewRequirements}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder radius="md" p="xs">
          <Group>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[
                {
                  color: 'green',
                  value: Math.max(0, lifeSupportProvided - lifeSupportRequired),
                },
                {
                  color: 'red',
                  value: Math.max(0, lifeSupportRequired - lifeSupportProvided),
                },
              ]}
              label={
                <Center>
                  <IconHeartbeat size={22} stroke={1.5} />
                </Center>
              }
            />

            <div>
              <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
                Life Support
              </Text>
              <Text weight={700} size="xl">
                {lifeSupportProvided - lifeSupportRequired}
              </Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>
      Components:
      {(shipDesign.data?.shipDesign?.components ?? newComponents).map(
        (component, idx) => (
          <Group key={component.id}>
            {!shipDesign.data?.shipDesign?.components && (
              <ActionIcon
                onClick={() =>
                  setNewComponents(
                    newComponents.filter((_, idx2) => idx !== idx2),
                  )
                }
              >
                <IconMinus />
              </ActionIcon>
            )}
            <Avatar />
            <Box>
              <Text>{component.name}</Text>
            </Box>
          </Group>
        ),
      )}
    </>
  );
}

function ShipComponent({
  name,
  powerDraw,
  crewRequirements,
  powerGeneration,
  crewCapacity,
  lifeSupport,
  onClick,
}: {
  name: string;
  powerDraw: number;
  crewRequirements: number;
  powerGeneration?: number;
  crewCapacity?: number;
  lifeSupport?: number;
  onClick: () => void;
}) {
  return (
    <Paper withBorder p="xs" my="xs" radius="md">
      <Group spacing="xs">
        <ActionIcon onClick={onClick}>
          <IconPlus />
        </ActionIcon>
        {name}
      </Group>
      <Group>
        {powerDraw && (
          <Text color="red" sx={{ display: 'flex', alignItems: 'center' }}>
            {powerDraw}
            <IconBolt size="1em" />
          </Text>
        )}
        {crewRequirements && (
          <Text color="red" sx={{ display: 'flex', alignItems: 'center' }}>
            {crewRequirements}
            <IconUsers size="1em" />
          </Text>
        )}
        {powerGeneration && (
          <Text color="green" sx={{ display: 'flex', alignItems: 'center' }}>
            {powerGeneration}
            <IconBolt size="1em" />
          </Text>
        )}
        {crewCapacity && (
          <Text color="green" sx={{ display: 'flex', alignItems: 'center' }}>
            {crewCapacity}
            <IconUsers size="1em" />
          </Text>
        )}
        {lifeSupport && (
          <Text color="green" sx={{ display: 'flex', alignItems: 'center' }}>
            {lifeSupport}
            <IconHeartbeat size="1em" />
          </Text>
        )}
      </Group>
    </Paper>
  );
}
