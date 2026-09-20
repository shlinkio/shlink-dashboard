import { render, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { Server } from '../../../app/entities/Server';
import Home from '../../../app/routes/index/home';

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
      setUp();

      await waitFor(() =>
        expect
          .element(screen.getByText('This application will help you manage your Shlink servers.'))
          .toBeInTheDocument(),
      );
      await expect.element(screen.getByTestId('servers-list')).not.toBeInTheDocument();
    });

    it('renders servers list when there is more than one server', async () => {
      setUp([fromPartial({ name: '1', publicId: '1' })]);

      await waitFor(() => expect.element(screen.getByTestId('servers-list')).toBeInTheDocument());
      await expect
        .element(screen.getByText('This application will help you manage your Shlink servers.'))
        .not.toBeInTheDocument();
    });
  });
});
