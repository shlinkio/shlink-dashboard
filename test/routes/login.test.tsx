import type { Session } from '@remix-run/node';
import { json } from '@remix-run/node';
import { createRemixStub } from '@remix-run/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Authenticator } from 'remix-auth';
import { CREDENTIALS_STRATEGY } from '../../app/auth/auth.server';
import type { SessionStorage } from '../../app/auth/session.server';
import Login, { action, loader } from '../../app/routes/login';

describe('login', () => {
  const authenticate = vi.fn();
  const isAuthenticated = vi.fn().mockResolvedValue(undefined);
  const authenticator = fromPartial<Authenticator>({ authenticate, isAuthenticated });
  const getSession = vi.fn();
  const commitSession = vi.fn().mockResolvedValue('');
  const sessionStorage = fromPartial<SessionStorage>({ getSession, commitSession });

  describe('action', () => {
    it.each([
      ['http://example.com', '/'],
      [`http://example.com?redirect-to=${encodeURIComponent('/foo/bar')}`, '/foo/bar'],
      [`http://example.com?redirect-to=${encodeURIComponent('https://example.com')}`, '/'],
      [`http://example.com?redirect-to=${encodeURIComponent('HTTPS://example.com')}`, '/'],
    ])('authenticates user and redirects to expected location', (url, expectedSuccessRedirect) => {
      const request = fromPartial<Request>({ url });
      action(fromPartial({ request }), authenticator);

      expect(authenticate).toHaveBeenCalledWith(CREDENTIALS_STRATEGY, request, {
        successRedirect: expectedSuccessRedirect,
        failureRedirect: url,
      });
    });
  });

  describe('loader', () => {
    it('checks authentication and exposes error from session, if any', async () => {
      const error = 'the_error';
      const session = fromPartial<Session>({ get: vi.fn().mockReturnValue(error) });
      getSession.mockResolvedValue(session);

      const headers = new Headers();
      headers.set('cookie', 'the_cookies');
      const request = fromPartial<Request>({ headers });

      const response = await loader(fromPartial({ request }), authenticator, sessionStorage);

      expect(await response.json()).toEqual({ error });
      expect(isAuthenticated).toHaveBeenCalled();
      expect(getSession).toHaveBeenCalledWith('the_cookies');
      expect(commitSession).toHaveBeenCalledWith(session);
    });
  });

  describe('<Login />', () => {
    const setUp = (error: unknown = undefined) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Login,
          loader: () => json({ error }),
        },
      ]);
      return render(<RemixStub />);
    };

    it('renders expected form controls', async () => {
      setUp();

      await waitFor(() => expect(screen.getByLabelText('Username:')).toBeInTheDocument());
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('renders error when present', async () => {
      setUp('some error');
      await waitFor(() => expect(screen.getByTestId('error-message')).toBeInTheDocument());
    });
  });
});
