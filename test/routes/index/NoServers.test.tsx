import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { SessionData } from '../../../app/auth/session-context';
import { SessionProvider } from '../../../app/auth/session-context';
import { NoServers } from '../../../app/routes/index/NoServers';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/set-up-test';

describe('<NoServers />', () => {
  const setUp = (session: SessionData | null = null) =>
    render(
      <MemoryRouter>
        <SessionProvider value={session}>
          <NoServers />
        </SessionProvider>
      </MemoryRouter>,
    );

  it.each([null, fromPartial<SessionData>({ role: 'admin' })])('passes a11y checks', (session) =>
    checkAccessibility(setUp(session)),
  );

  it.each([
    fromPartial<SessionData>({ role: 'managed-user' }),
    fromPartial<SessionData>({ role: 'advanced-user' }),
    fromPartial<SessionData>({ role: 'admin' }),
  ])('shows button to create servers only for non-managed users', async (session) => {
    const screen = await setUp(session);

    if (session.role !== 'managed-user') {
      await expect.element(screen.getByRole('link', { name: 'Add a server' })).toBeInTheDocument();
    } else {
      await expect.element(screen.getByRole('link', { name: 'Add a server' })).not.toBeInTheDocument();
    }
  });
});
