import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { NoServers } from '../../../app/routes/_index/NoServers';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<NoServers />', () => {
  const setUp = () => render(
    <MemoryRouter>
      <NoServers />
    </MemoryRouter>
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));
});
