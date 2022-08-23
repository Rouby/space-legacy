import { AppShell, MantineProvider } from '@mantine/core';
import {
  Outlet,
  parseSearchWith,
  ReactLocation,
  Router,
  stringifySearchWith,
} from '@tanstack/react-location';
import { Provider } from 'urql';
import { parse, stringify } from 'zipson';
import { Navigation } from './components';
import { useClient } from './graphql';
import { Dashboard, StarSystemView } from './pages';

const reactLocation = new ReactLocation({
  parseSearch: parseSearchWith((value) =>
    parse(decodeURIComponent(atob(value))),
  ),
  stringifySearch: stringifySearchWith((value) =>
    btoa(encodeURIComponent(stringify(value))),
  ),
});

export default function App() {
  const client = useClient();
  return (
    <Provider value={client}>
      <Router
        location={reactLocation}
        routes={[
          { path: '/', element: <Dashboard /> },
          {
            path: 'star-system',
            children: [{ path: ':starSystemId', element: <StarSystemView /> }],
          },
        ]}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ colorScheme: 'dark' }}
        >
          <AppShell navbar={<Navigation />}>
            <Outlet />
          </AppShell>
        </MantineProvider>
      </Router>
    </Provider>
  );
}
