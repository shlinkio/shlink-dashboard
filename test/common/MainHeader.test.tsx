import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { SessionData } from '../../app/auth/session-context';
import { SessionProvider } from '../../app/auth/session-context';
import { MainHeader } from '../../app/common/MainHeader';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<MainHeader />', () => {
  const setUp = (session: SessionData | null = null) => render(
    <SessionProvider value={session}>
      <MemoryRouter>
        <MainHeader />
      </MemoryRouter>
    </SessionProvider>,
  );

  it.each([
    [fromPartial<SessionData>({ displayName: 'Jane' })],
    [fromPartial<SessionData>({ username: 'jane' })],
  ])('passes a11y checks', (session) => checkAccessibility(setUp(session)));

  it.each([
    [undefined],
    [fromPartial<SessionData>({ displayName: 'Jane Doe' })],
    [fromPartial<SessionData>({ displayName: '', username: 'john_doe' })],
    [fromPartial<SessionData>({ username: 'john_doe' })],
  ])('shows user menu toggle only if session is set', (session) => {
    setUp(session);

    if (session) {
      expect(screen.getByRole('button', { name: session.displayName || session.username })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
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
  ])('shows expected options depending on the user role', (
    { sessionData, shouldShowUsersMenu, shouldShowManageServers },
  ) => {
    setUp(sessionData);

    if (shouldShowUsersMenu) {
      expect(screen.getByText('Manage users')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Manage users')).not.toBeInTheDocument();
    }

    if (shouldShowManageServers) {
      expect(screen.getByText('Manage servers')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Manage servers')).not.toBeInTheDocument();
    }
  });
});
