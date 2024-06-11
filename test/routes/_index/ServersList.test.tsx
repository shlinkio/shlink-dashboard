import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { Server } from '../../../app/entities/Server';
import { ServersList } from '../../../app/routes/_index/ServersList';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ServersList />', () => {
  const setUp = (servers: Server[]) => render(
    <MemoryRouter>
      <ServersList servers={servers} />
    </MemoryRouter>
  );

  it('passes a11y checks', () => checkAccessibility(setUp([
    fromPartial({ name: 'Foo', publicId: '1' }),
    fromPartial({ name: 'Bar', publicId: '2' }),
  ])));

  it.each([
    [[]],
    [['1','2','3'].map(((name) => fromPartial<Server>({ name, publicId: name })))],
    [[fromPartial<Server>({ name: 'Foo', publicId: '1' })]],
  ])('renders expected amount of links', (servers) => {
    setUp(servers);

    expect(screen.queryAllByRole('link')).toHaveLength(servers.length);
  });
});
