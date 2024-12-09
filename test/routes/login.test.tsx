import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import Login, { action, loader } from '../../app/routes/login';

describe('login', () => {
  const login = vi.fn().mockResolvedValue(fromPartial({}));
  const isAuthenticated = vi.fn().mockResolvedValue(undefined);
  const authHelper = fromPartial<AuthHelper>({ login, isAuthenticated });

  describe('action', () => {
    it('authenticates user', () => {
      const request = fromPartial<Request>({});
      action(fromPartial({ request }), authHelper);

      expect(login).toHaveBeenCalledWith(request);
    });

    it.each([
      { message: 'Incorrect password' },
      { message: 'User not found' },
    ])('returns json response when credentials are incorrect', async ({ message }) => {
      login.mockRejectedValue(new Error(message));

      const request = fromPartial<Request>({});
      const response = await action(fromPartial({ request }), authHelper);

      expect(response).toEqual({ error: true });
    });

    it('re-throws unknown errors', async () => {
      const e = new Error('Unknown error');
      const request = fromPartial<Request>({});

      login.mockRejectedValue(e);

      await expect(() => action(fromPartial({ request }), authHelper)).rejects.toEqual(e);
    });
  });

  describe('loader', () => {
    it('redirects if user is authenticated', async () => {
      isAuthenticated.mockResolvedValue(true);

      const request = fromPartial<Request>({});
      const response = await loader(fromPartial({ request }), authHelper);

      expect(response).instanceof(Response);
    });

    it('returns empty if user is not authenticated', async () => {
      isAuthenticated.mockResolvedValue(false);

      const request = fromPartial<Request>({});
      const response = await loader(fromPartial({ request }), authHelper);

      expect(response).toEqual({});
    });
  });

  describe('<Login />', () => {
    const setUp = (error: boolean = false) => {
      const RemixStub = createRoutesStub([
        {
          path: '/',
          Component: Login,
          action: () => ({ error }),
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

    // TODO Investigate why this doesn't pass
    it.skip('renders error when present', async () => {
      setUp(true);
      await waitFor(() => expect(screen.getByText('Username or password are incorrect')).toBeInTheDocument());
    });
  });
});
