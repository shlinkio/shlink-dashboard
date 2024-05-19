import type { LoaderFunctionArgs } from '@remix-run/node';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Authenticator } from 'remix-auth';
import { loader as logoutLoader } from '../../app/routes/logout';

describe('logout', () => {
  const logout = vi.fn();
  const authenticator = fromPartial<Authenticator>({ logout });
  const setUp = () => (args: LoaderFunctionArgs) => logoutLoader(args, authenticator);

  it('logs out in authenticator', () => {
    const request = fromPartial<Request>({});
    const action = setUp();

    action(fromPartial({ request }));

    expect(logout).toHaveBeenCalledWith(request, { redirectTo: '/login' });
  });
});
