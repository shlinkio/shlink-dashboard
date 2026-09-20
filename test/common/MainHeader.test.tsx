import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { SessionData } from '../../app/auth/session-context';
import { SessionProvider } from '../../app/auth/session-context';
import { MainHeader } from '../../app/common/MainHeader';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('<MainHeader />', () => {
  const setUp = (session: SessionData | null = null) =>
    renderWithEvents(
      <SessionProvider value={session}>
        <MemoryRouter>
          <MainHeader />
        </MemoryRouter>
      </SessionProvider>,
    );

  it.each([[fromPartial<SessionData>({ displayName: 'Jane' })], [fromPartial<SessionData>({ username: 'jane' })]])(
    'passes a11y checks',
    (session) => checkAccessibility(setUp(session)),
  );

  it.each([
    [undefined],
    [fromPartial<SessionData>({ displayName: 'Jane Doe' })],
    [fromPartial<SessionData>({ displayName: '', username: 'john_doe' })],
    [fromPartial<SessionData>({ username: 'john_doe' })],
  ])('shows user menu toggle only if session is set', async (session) => {
    setUp(session);

    if (session) {
      await expect.element(screen.getByTestId('user-menu')).toHaveTextContent(session.displayName || session.username);
    } else {
      await expect.element(screen.getByTestId('user-menu')).not.toBeInTheDocument();
    }
  });

  it.each([
    {
      sessionData: fromPartial<SessionData>({ role: 'admin' }),
      shouldShowUsersMenu: true,
      shouldShowManageServers: true,
    },
    {
      sessionData: fromPartial<SessionData>({ role: 'advanced-user' }),
      shouldShowUsersMenu: false,
      shouldShowManageServers: true,
    },
    {
      sessionData: fromPartial<SessionData>({ role: 'managed-user' }),
      shouldShowUsersMenu: false,
      shouldShowManageServers: false,
    },
  ])(
    'shows expected options depending on the user role',
    async ({ sessionData, shouldShowUsersMenu, shouldShowManageServers }) => {
      const { user } = setUp({ ...sessionData, displayName: 'Foo' });

      // Open menu
      await user.click(screen.getByRole('button', { name: 'Foo' }));

      if (shouldShowUsersMenu) {
        await expect.element(screen.getByText('Manage users')).toBeInTheDocument();
      } else {
        await expect.element(screen.getByText('Manage users')).not.toBeInTheDocument();
      }

      if (shouldShowManageServers) {
        await expect.element(screen.getByText('Manage servers')).toBeInTheDocument();
      } else {
        await expect.element(screen.getByText('Manage servers')).not.toBeInTheDocument();
      }
    },
  );
});
