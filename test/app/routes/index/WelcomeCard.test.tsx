import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { Server } from '../../../../app/entities/Server';
import { WelcomeCard } from '../../../../app/routes/index/WelcomeCard';
import { checkAccessibility } from '../../../__helpers__/accessibility';

describe('<WelcomeCard />', () => {
  const setUp = (servers: Server[]) => render(
    <MemoryRouter>
      <WelcomeCard servers={servers} />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp([])));

  it('renders no-servers welcome page when there are no servers', () => {
    setUp([]);

    expect(screen.getByText('This application will help you manage your Shlink servers.')).toBeInTheDocument();
    expect(screen.queryByTestId('servers-list')).not.toBeInTheDocument();
  });

  it('renders servers list when there is more than one server', () => {
    setUp([fromPartial({ name: '1', publicId: '1' })]);

    expect(screen.getByTestId('servers-list')).toBeInTheDocument();
    expect(screen.queryByText('This application will help you manage your Shlink servers.')).not.toBeInTheDocument();
  });
});
