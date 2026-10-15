import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { Server } from '../../../app/entities/Server';
import Home from '../../../app/routes/index/home';
import { render } from '../../__helpers__/set-up-test';

describe('home', () => {
  describe('<Home />', () => {
    const setUp = (servers: Server[] = []) => {
      const Stub = createRoutesStub([
        {
          path: '/',
          Component: Home,
          HydrateFallback: () => null,
          loader: () => ({ servers }),
        },
      ]);
      return render(<Stub />);
    };

    it('renders no-servers welcome page when there are no servers', async () => {
      const screen = await setUp();

      await expect
        .element(screen.getByText('This application will help you manage your Shlink servers.'))
        .toBeInTheDocument();
      await expect.element(screen.getByTestId('servers-list')).not.toBeInTheDocument();
    });

    it('renders servers list when there is more than one server', async () => {
      const screen = await setUp([fromPartial({ name: '1', publicId: '1' })]);

      await expect.element(screen.getByTestId('servers-list')).toBeInTheDocument();
      await expect
        .element(screen.getByText('This application will help you manage your Shlink servers.'))
        .not.toBeInTheDocument();
    });
  });
});
