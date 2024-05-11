import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MainHeader } from '../../app/common/MainHeader';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<MainHeader />', () => {
  const setUp = () => render(
    <MemoryRouter>
      <MainHeader />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));
});
