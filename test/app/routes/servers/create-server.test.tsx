import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import CreateServer, { action } from '../../../../app/routes/servers/create-server';
import type { ServersService } from '../../../../app/servers/ServersService.server';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/set-up-test';

describe('create-server', () => {
  describe('action', () => {
    const createServerForUser = vi.fn();
    const serversService: ServersService = fromPartial({ createServerForUser });
    const runAction = () => action(
      fromPartial({
        request: { formData: vi.fn().mockResolvedValue(new FormData()) },
        context: { get: vi.fn().mockReturnValue({ publicId: '123' }) },
      }),
      serversService,
    );

    it('redirects to servers list after creating a server', async () => {
      const resp = await runAction();

      expect(resp.status).toEqual(302);
      expect(resp.headers.get('Location')).toEqual('/manage-servers/1');
      expect(createServerForUser).toHaveBeenLastCalledWith('123', new FormData());
    });
  });

  describe('<CreateServer />', () => {
    const setUp = async () => {
      const path = '/manage-servers/create';
      const Stub = createRoutesStub([
        {
          path,
          Component: CreateServer,
          HydrateFallback: () => null,
          action: () => ({}),
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.findByText('Add new server');

      return result;
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form', async () => {
      await setUp();

      expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^URL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^API key/)).toBeInTheDocument();
    });

    // TODO Investigate why this test does not pass, as there's a similar one in create-user test
    it.skip('disables form while saving', async () => {
      const { user } = await setUp();

      await user.type(screen.getByLabelText(/^Name/), 'The name');
      await user.type(screen.getByLabelText(/^URL/), 'https://example.com');
      await user.type(screen.getByLabelText(/^Name/), 'api-key');
      const submitPromise = user.click(screen.getByRole('button', { name: 'Create server' }));

      await waitFor(() => expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled());
      await submitPromise;
    });
  });
});
