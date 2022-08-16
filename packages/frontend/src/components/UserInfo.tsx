import {
  Button,
  Checkbox,
  Group,
  Modal,
  PasswordInput,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLogin } from '@tabler/icons';
import { useState } from 'react';
import { useLoginMutation } from '../graphql';
import { useAbility, useToken } from '../utility';

export function UserInfo() {
  const ability = useAbility();
  const isSignedIn = ability.can('read', 'User');

  const [loginShown, setLoginShown] = useState(false);

  /* GraphQL */ `#graphql
    mutation Login($email: String!, $password: String!, $rememberMe: Boolean) {
      login(email: $email, password: $password, rememberMe: $rememberMe)
    }
  `;
  const [loginResult, login] = useLoginMutation();
  const [, setToken] = useToken();

  return (
    <>
      {isSignedIn ? (
        'hello user'
      ) : (
        <UnstyledButton
          sx={(theme) => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color:
              theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

            '&:hover': {
              backgroundColor:
                theme.colorScheme === 'dark'
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
            },
          })}
          onClick={() => setLoginShown(true)}
        >
          <Group>
            <ThemeIcon variant="light">
              <IconLogin />
            </ThemeIcon>

            <Text size="sm">Login</Text>
          </Group>
        </UnstyledButton>
      )}
      <Modal
        centered
        opened={loginShown}
        onClose={() => setLoginShown(false)}
        withCloseButton={false}
      >
        <LoginForm
          onSubmit={(values) =>
            login(values).then((result) => {
              if (result.data?.login) {
                setToken(result.data.login, !values.rememberMe);
                setLoginShown(false);
              }
            })
          }
          loading={loginResult.fetching}
          error={loginResult.error?.message}
        />
      </Modal>
    </>
  );
}

function LoginForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => void;
  loading: boolean;
  error?: React.ReactNode;
}) {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        required
        name="login"
        label="Email"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
      />

      <PasswordInput
        required
        name="password"
        label="Password"
        {...form.getInputProps('password')}
      />

      <Checkbox
        mt="md"
        label="Remember me"
        {...form.getInputProps('rememberMe', { type: 'checkbox' })}
      />

      <Group position="apart" mt="md">
        <Text color="red">{error}</Text>
        <Group position="right">
          <Button type="submit" loading={loading}>
            Login
          </Button>
        </Group>
      </Group>
    </form>
  );
}
