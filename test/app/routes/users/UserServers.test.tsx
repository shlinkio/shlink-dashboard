import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { MinimalServer, UserServersProps } from '../../../../app/routes/users/UserServers';
import { UserServers } from '../../../../app/routes/users/UserServers';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/set-up-test';

describe('<UserServers />', () => {
  const onSearch = vi.fn();
  const setUp = (props: Partial<UserServersProps> = {}) => renderWithEvents(
    <UserServers initialServers={[]} onSearch={onSearch} loading={false} {...props} />,
  );
  const server = (props: Partial<Omit<MinimalServer, 'publicId'>>): MinimalServer => fromPartial(
    { ...props, publicId: crypto.randomUUID() },
  );

  beforeEach(() => {
    // Make all timeouts be still async, but resolve immediately
    const globalSetTimeout = setTimeout;
    vi.stubGlobal('setTimeout', (callback: () => unknown) => globalSetTimeout(callback, 0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    {},
    { loading: true },
    { initialServers: [server({ name: 'Foo' }), server({ name: 'Bar' })] },
  ])('passes a11y checks', (props) => checkAccessibility(setUp(props)));

  it('calls onSearch when searching in combobox', async () => {
    const { user } = setUp();

    await user.type(screen.getByPlaceholderText('Search servers to add...'), 'something');
    expect(onSearch).toHaveBeenCalledWith('something');
  });

  it('shows fallback message if there are no servers for the user', () => {
    setUp();
    expect(screen.getByText('This user has no servers')).toBeInTheDocument();
  });

  it('shows a row for every server the user has', () => {
    const initialServers = [server({ name: 'Foo' }), server({ name: 'Bar' }), server({ name: 'Baz' })];
    setUp({ initialServers });

    expect(screen.queryByText('This user has no servers')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(initialServers.length + 1);
  });

  it('can remove existing servers', async () => {
    const initialServers = [server({ name: 'Foo' }), server({ name: 'Bar' }), server({ name: 'Baz' })];
    const { user } = setUp({ initialServers });

    expect(screen.getAllByRole('row')).toHaveLength(4);
    await user.click(screen.getByLabelText('Remove Foo'));
    expect(screen.getAllByRole('row')).toHaveLength(3);
    await user.click(screen.getByLabelText('Remove Bar'));
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('can add servers from the search results', async () => {
    const initialServers = [server({ name: 'Foo1' }), server({ name: 'Foo2' })];
    const searchResults = [server({ name: 'Bar1' }), server({ name: 'bar2' }), server({ name: 'bar3' })];
    const { user } = setUp({ initialServers, searchResults });

    expect(screen.getAllByRole('row')).toHaveLength(initialServers.length + 1);
    await user.click(screen.getByLabelText('Search servers to add'));

    // Add second search result. Should add one row
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('row')).toHaveLength(initialServers.length + 2);

    // Add third search result. Should add one row
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('row')).toHaveLength(initialServers.length + 3);

    // Add third search result again. Should be skipped as duplicated
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('row')).toHaveLength(initialServers.length + 3);
  });
});
