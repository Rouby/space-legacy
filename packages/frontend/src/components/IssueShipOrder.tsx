import { subject } from '@casl/ability';
import {
  Button,
  LoadingOverlay,
  NumberInput,
  Popover,
  Select,
} from '@mantine/core';
import { useState } from 'react';
import {
  useFollowShipMutation,
  useIssueOrderShipDetailsQuery,
  useMoveShipMutation,
  useShipSelectQuery,
} from '../graphql';
import { useAbility, useGame } from '../utility';

export function IssueShipOrder({ shipId }: { shipId: string }) {
  const [game] = useGame();
  const ability = useAbility();

  /* GraphQL */ `#graphql
    query IssueOrderShipDetails($gameId: ID!, $id: ID!) {
      ship(gameId: $gameId, id: $id) {
        id
        owner {
          id
        }
        coordinates
        movingTo
      }
    }
  `;
  const [{ data, fetching }] = useIssueOrderShipDetailsQuery({
    variables: { gameId: game?.id!, id: shipId },
  });

  /* GraphQL */ `#graphql
    mutation moveShip($gameId: ID!, $shipId: ID!, $to: Coordinates!) {
      moveShip(input: { gameId: $gameId, shipId: $shipId, to: $to }) {
        id
        movingTo
      }
    }
  `;
  const [moveShipResult, moveShip] = useMoveShipMutation();

  const [open, setOpen] = useState(false);

  /* GraphQL */ `#graphql
    query ShipSelect($gameId: ID!) {
      ships(gameId: $gameId) {
        id
      }
    }
  `;
  const [shipSelect] = useShipSelectQuery({ variables: { gameId: game?.id! } });

  /* GraphQL */ `#graphql
    mutation followShip($gameId: ID!, $shipId: ID!, $followId: ID!) {
      followShip(input: { gameId: $gameId, shipId: $shipId, shipToFollowId: $followId }) {
        id
        movingTo
      }
    }
  `;
  const [followShipResult, followShip] = useFollowShipMutation();

  return (
    <Popover trapFocus withArrow opened={open} onChange={setOpen}>
      <Popover.Target>
        <Button
          loading={fetching}
          onClick={() => setOpen((o) => !o)}
          disabled={
            !data?.ship || ability.cannot('move', subject('Ship', data?.ship))
          }
        >
          Move
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <LoadingOverlay visible={fetching} />
        <form
          onSubmit={(evt) => {
            evt.preventDefault();

            if (evt.nativeEvent instanceof SubmitEvent) {
              switch ((evt.nativeEvent.submitter as HTMLButtonElement).value) {
                case 'move': {
                  moveShip({
                    gameId: game?.id!,
                    shipId: data?.ship?.id!,
                    to: {
                      x: +evt.currentTarget['to.x'].value,
                      y: +evt.currentTarget['to.y'].value,
                    },
                  }).then(() => setOpen(false));
                }
                case 'follow': {
                  followShip({
                    gameId: game?.id!,
                    shipId: data?.ship?.id!,
                    followId: evt.currentTarget['followId'].value,
                  }).then(() => setOpen(false));
                }
              }
            }
          }}
        >
          <NumberInput
            name="to.x"
            placeholder="x"
            defaultValue={(data?.ship?.movingTo ?? data?.ship?.coordinates)?.x}
            precision={5}
          />
          <NumberInput
            name="to.y"
            placeholder="y"
            defaultValue={(data?.ship?.movingTo ?? data?.ship?.coordinates)?.y}
            precision={5}
          />
          <Button
            loading={moveShipResult.fetching}
            name="order"
            value="move"
            type="submit"
          >
            Issue move order
          </Button>
          <Select
            name="followId"
            label="Follow ship"
            data={
              shipSelect.data?.ships.map((ship) => ({
                value: ship.id,
                label: `Ship ${ship.id}`,
              })) ?? []
            }
          />
          <Button
            loading={followShipResult.fetching}
            name="order"
            value="follow"
            type="submit"
          >
            Issue follow order
          </Button>
        </form>
      </Popover.Dropdown>
    </Popover>
  );
}
