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
  ])('shows user menu toggle only if session is set', (session) => {
    setUp(session);

    if (session) {
      expect(screen.getByRole('button', { name: 'Jane Doe' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    }
  });

  it.each([
    [fromPartial<SessionData>({ username: 'jane_doe' })],
    [fromPartial<SessionData>({ displayName: 'Jane Doe' })],
  ])('shows display name only if not null', (session) => {
    setUp(session);
    expect(screen.getByTestId('display-name')).toHaveTextContent(session.displayName ?? session.username);
  });

  it.each([
    { sessionData: fromPartial<SessionData>({ role: 'admin' }), shouldShowUsersMenu: true },
    { sessionData: fromPartial<SessionData>({ role: 'advanced-user' }), shouldShowUsersMenu: false },
    { sessionData: fromPartial<SessionData>({ role: 'managed-user' }), shouldShowUsersMenu: false },
  ])('shows user management option for admins', ({ sessionData, shouldShowUsersMenu }) => {
    setUp(sessionData);

    if (shouldShowUsersMenu) {
      expect(screen.getByText('Manage users')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Manage users')).not.toBeInTheDocument();
    }
  });
});
