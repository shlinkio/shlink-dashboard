import type { ShlinkVersionsContainerProps } from '../../app/common/ShlinkVersionsContainer';
import { ShlinkVersionsContainer } from '../../app/common/ShlinkVersionsContainer';
import { checkAccessibility } from '../__helpers__/accessibility';
import { render } from '../__helpers__/set-up-test';

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
  ])('renders expected dashboard version', async ({ dashboardVersion, expectedText }) => {
    const screen = await setUp({ dashboardVersion });

    await expect.element(screen.getByText(/^Dashboard/)).toHaveTextContent(expectedText);
    await expect.element(screen.getByText(/Server/)).not.toBeInTheDocument();
  });

  it.each([
    { serverVersion: 'not-semver', expectedText: 'latest' },
    { serverVersion: '4.5.6', expectedText: 'v4.5.6' },
  ])('renders expected server version', async ({ serverVersion, expectedText }) => {
    const screen = await setUp({ serverVersion });
    await expect.element(screen.getByText(/Server/)).toHaveTextContent(`- Server: ${expectedText}`);
  });
});
