import { createRoutesStub } from 'react-router';
import CreateServer from '../../../app/routes/servers/create-server';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('create-server', () => {
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

      const screen = await renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.getByText('Add new server').findElement();

      return screen;
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form', async () => {
      const screen = await setUp();

      await expect.element(screen.getByLabelText(/^Name/)).toBeInTheDocument();
      await expect.element(screen.getByLabelText(/^URL/)).toBeInTheDocument();
      await expect.element(screen.getByLabelText(/^API key/)).toBeInTheDocument();
    });

    // FIXME Skipping, as vitest/browser requires user events to be awaited, so intermediary loading states cannot be
    //       tested
    it.skip('disables form while saving', async () => {
      const { user, ...screen } = await setUp();

      await user.type(screen.getByLabelText(/^Name/), 'The name');
      await user.type(screen.getByLabelText(/^URL/), 'https://example.com');
      await user.type(screen.getByLabelText(/^Name/), 'api-key');
      const submitPromise = user.click(screen.getByRole('button', { name: 'Create server' }));

      await expect.element(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
      await submitPromise;
    });
  });
});
