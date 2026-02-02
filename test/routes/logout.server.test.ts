import { fromPartial } from '@total-typescript/shoehorn';
import type { LoaderFunctionArgs } from 'react-router';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import { loader as logoutLoader } from '../../app/routes/logout';

describe('logout', () => {
  const logout = vi.fn();
  const authHelper = fromPartial<AuthHelper>({ logout });
  const setUp = () => (args: LoaderFunctionArgs) => logoutLoader(args, authHelper);

  it('logs out in authenticator', () => {
    const request = fromPartial<Request>({});
    const action = setUp();

    action(fromPartial({ request }));

    expect(logout).toHaveBeenCalledWith(request);
  });
});
