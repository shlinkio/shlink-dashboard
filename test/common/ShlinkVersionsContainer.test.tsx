import { render, screen } from '@testing-library/react';
import type { ShlinkVersionsContainerProps } from '../../app/common/ShlinkVersionsContainer';
import { ShlinkVersionsContainer } from '../../app/common/ShlinkVersionsContainer';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<ShlinkVersionsContainer />', () => {
  const setUp = (props?: ShlinkVersionsContainerProps) => render(<ShlinkVersionsContainer {...props} />);

  it.each([
    {} satisfies ShlinkVersionsContainerProps,
    { serverVersion: '1.2.3' } satisfies ShlinkVersionsContainerProps,
    { serverVersion: '1.2.3', dashboardVersion: '4.5.6' } satisfies ShlinkVersionsContainerProps,
  ])('passes a11y checks', (props) => checkAccessibility(setUp(props)));

  it.each([
    { dashboardVersion: undefined, expectedText: 'Dashboard: latest' },
    { dashboardVersion: 'not-semver', expectedText: 'Dashboard: latest' },
    { dashboardVersion: '4.5.6', expectedText: 'Dashboard: v4.5.6' },
  ])('renders expected dashboard version', ({ dashboardVersion, expectedText }) => {
    setUp({ dashboardVersion });

    expect(screen.getByText(/^Dashboard/)).toHaveTextContent(expectedText);
    expect(screen.queryByText(/Server/)).not.toBeInTheDocument();
  });

  it.each([
    { serverVersion: 'not-semver', expectedText: 'Server: latest' },
    { serverVersion: '4.5.6', expectedText: 'Server: v4.5.6' },
  ])('renders expected server version', ({ serverVersion, expectedText }) => {
    setUp({ serverVersion });
    expect(screen.getByText(/Server/)).toHaveTextContent(expectedText);
  });
});
