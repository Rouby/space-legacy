import { Subject } from '@casl/ability';
import { Button, Popover, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { forwardRef } from 'react';
import { useAbility } from '../utility';

export const AbilityButton = forwardRef(function AbilityButton(
  {
    on,
    and,
    onClick,
    loading,
    children,
    ...props
  }: ({ can: string } | { cannot: string }) & {
    on?: Subject;
    and?: boolean;
    onClick: () => void;
    loading?: boolean;
    children: React.ReactNode;
  },
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const [opened, { close, open }] = useDisclosure(false);
  const ability = useAbility();

  const disabled = !on
    ? true
    : ('can' in props
        ? ability.cannot(props.can, on)
        : ability.can(props.cannot, on)) &&
      (and === undefined || and);

  const reason = !on
    ? '...'
    : ability.relevantRuleFor('can' in props ? props.can : props.cannot, on)
        ?.reason;

  return (
    <Popover shadow="md" opened={opened && disabled && !!reason}>
      <Popover.Target>
        <span onMouseEnter={open} onMouseLeave={close}>
          <Button
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            ref={ref}
          >
            {children}
          </Button>
        </span>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
        <Text size="sm">{reason}</Text>
      </Popover.Dropdown>
    </Popover>
  );
});
