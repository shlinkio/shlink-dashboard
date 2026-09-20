import { render } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { Server } from '../../../app/entities/Server';
import { WelcomeCard } from '../../../app/routes/index/WelcomeCard';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<WelcomeCard />', () => {
  const setUp = (servers: Server[]) =>
    render(
      <MemoryRouter>
        <WelcomeCard servers={servers} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp([])));

  it('renders no-servers welcome page when there are no servers', async () => {
    setUp([]);

    await expect
      .element(screen.getByText('This application will help you manage your Shlink servers.'))
      .toBeInTheDocument();
    await expect.element(screen.getByTestId('servers-list')).not.toBeInTheDocument();
  });

  it('renders servers list when there is more than one server', async () => {
    setUp([fromPartial({ name: '1', publicId: '1' })]);

    await expect.element(screen.getByTestId('servers-list')).toBeInTheDocument();
    await expect
      .element(screen.getByText('This application will help you manage your Shlink servers.'))
      .not.toBeInTheDocument();
  });
});
