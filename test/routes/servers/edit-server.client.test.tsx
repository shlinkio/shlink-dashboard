import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { Server } from '../../../app/entities/Server';
import EditServer from '../../../app/routes/servers/edit-server';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('edit-server', () => {
  describe('<EditServer />', () => {
    const setUp = async () => {
      const path = '/manage-servers/1';
      const Stub = createRoutesStub([
        {
          path,
          Component: EditServer,
          HydrateFallback: () => null,
          loader: () => ({
            server: fromPartial<Server>({ name: 'the name', baseUrl: 'the base url', apiKey: 'the api key' }),
          }),
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.findByText(/^Edit server/);

      return result;
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form with initial server data', async () => {
      await setUp();

      expect(screen.getByLabelText(/^Name/)).toHaveValue('the name');
      expect(screen.getByLabelText(/^URL/)).toHaveValue('the base url');
      expect(screen.getByLabelText(/^API key/)).toHaveValue('the api key');
    });
  });
});
