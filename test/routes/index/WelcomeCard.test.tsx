import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { Server } from '../../../app/entities/Server';
import { WelcomeCard } from '../../../app/routes/index/WelcomeCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/set-up-test';

describe('<WelcomeCard />', () => {
  const setUp = (servers: Server[]) =>
    render(
      <MemoryRouter>
        <WelcomeCard servers={servers} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp([])));

  it('renders no-servers welcome page when there are no servers', async () => {
    const screen = await setUp([]);

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
