import { createRoutesStub } from 'react-router';
import CreateServer from '../../../app/routes/servers/create-server';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('create-server', () => {
  describe('<CreateServer />', () => {
    const setUp = async () => {
      const { promise, resolve: resolveActionPromise } = Promise.withResolvers<void>();
      const action = vi.fn(async () => {
        // Make the action wait until we resolve it, so that we can test intermediary fetcher state transitions
        await promise;
        return {};
      });

      const path = '/manage-servers/create';
      const Stub = createRoutesStub([
        {
          path,
          Component: CreateServer,
          HydrateFallback: () => null,
          action,
        },
      ]);

      const renderResult = await renderWithEvents(<Stub initialEntries={[path]} />);
      return { ...renderResult, action, resolveActionPromise };
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form', async () => {
      const screen = await setUp();

      await expect.element(screen.getByLabelText(/^Name/)).toBeInTheDocument();
      await expect.element(screen.getByLabelText(/^URL/)).toBeInTheDocument();
      await expect.element(screen.getByLabelText(/^API key/)).toBeInTheDocument();
    });

    it('disables form while saving', async () => {
      const { user, action, resolveActionPromise, ...screen } = await setUp();

      await user.type(screen.getByLabelText(/^Name/), 'The name');
      await user.type(screen.getByLabelText(/^URL/), 'https://example.com');
      await user.type(screen.getByLabelText(/^API key/), 'api-key');

      expect(action).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Create server' }));

      expect(action).toHaveBeenCalled();
      await expect.element(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();

      resolveActionPromise();
    });
  });
});
