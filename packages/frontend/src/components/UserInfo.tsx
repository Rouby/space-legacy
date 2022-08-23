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
import {
  useEndTurnMutation,
  useLoginMutation,
  useRegisterMutation,
} from '../graphql';
import { useAbility, useGame, useToken } from '../utility';

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

  /* GraphQL */ `#graphql
    mutation Register($email: String!, $password: String!, $name:String!) {
      signup(email: $email, password: $password, name: $name)
    }
  `;
  const [registerResult, register] = useRegisterMutation();

  const [token, setToken] = useToken();

  /* GraphQL */ `#graphql
    mutation EndTurn($gameId: ID!) {
      endTurn(input: {gameId : $gameId}) 
    }
  `;
  const [endTurnResult, endTurn] = useEndTurnMutation();

  const [game] = useGame();

  return (
    <>
      {isSignedIn ? (
        <>
          {`Hello ${token?.space.name}`}
          {game && (
            <Button
              disabled={ability.cannot('endTurn', game)}
              onClick={() => endTurn({ gameId: game?.id! })}
            >
              End Turn
            </Button>
          )}
        </>
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
            (values.mode === 'login'
              ? login(values).then((result) => ({
                  token: result.data?.login,
                  rememberMe: values.rememberMe,
                }))
              : register(values).then((result) => ({
                  token: result.data?.signup,
                  rememberMe: false,
                }))
            ).then((result) => {
              if (result.token) {
                setToken(result.token, !result.rememberMe);
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
    name: string;
    mode: 'login' | 'register';
  }) => void;
  loading: boolean;
  error?: React.ReactNode;
}) {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,

      name: '',

      mode: 'login' as 'login' | 'register',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      name: (value, values) =>
        values.mode === 'register'
          ? value.length > 2
            ? null
            : 'Name must be at least 3 characters'
          : null,
    },
  });

  return (
    <form id="login" onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        required
        name="login"
        autoComplete="username"
        label="Email"
        placeholder="your@email.com"
        {...form.getInputProps('email')}
      />

      <PasswordInput
        required
        name="password"
        autoComplete={
          form.values.mode === 'login' ? 'current-password' : 'new-password'
        }
        label="Password"
        {...form.getInputProps('password')}
      />

      {form.values.mode === 'login' && (
        <Checkbox
          mt="md"
          label="Remember me"
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />
      )}

      {form.values.mode === 'register' && (
        <TextInput
          required
          minLength={3}
          name="name"
          label="Name"
          placeholder="Your name"
          {...form.getInputProps('name')}
        />
      )}

      <Group position="apart" mt="md" noWrap>
        <Text color="red">{error}</Text>
        <Group position="right" noWrap>
          <Button
            variant="subtle"
            disabled={loading}
            onClick={() =>
              form.setFieldValue(
                'mode',
                form.values.mode === 'login' ? 'register' : 'login',
              )
            }
          >
            {form.values.mode === 'register' ? 'Login' : 'Create Account'}
          </Button>
          <Button type="submit" loading={loading}>
            {form.values.mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </Group>
      </Group>
    </form>
  );
}
