import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { SessionData } from '../../app/auth/session-context';
import { SessionProvider } from '../../app/auth/session-context';
import { MainHeader } from '../../app/common/MainHeader';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<MainHeader />', () => {
  const setUp = (session?: SessionData) => render(
    <SessionProvider value={session ?? null}>
      <MemoryRouter>
        <MainHeader />
      </MemoryRouter>
    </SessionProvider>,
  );

  it.each([
    [undefined],
    [fromPartial<SessionData>({})],
  ])('passes a11y checks', (session) => checkAccessibility(setUp(session)));

  it.each([
    [undefined],
    [fromPartial<SessionData>({})],
  ])('shows logout and menu toggle only if session is set', (session) => {
    setUp(session);

    if (session) {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Logout' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    }
  });
});
