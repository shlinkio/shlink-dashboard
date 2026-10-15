import { createRoutesStub } from 'react-router';
import ChangePassword from '../../app/routes/change-password';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('change-password', () => {
  describe('<ChangePassword />', () => {
    const setUp = (error?: string) => {
      const path = '/change-password';
      const Stub = createRoutesStub([
        {
          path,
          Component: ChangePassword,
          HydrateFallback: () => null,
          action: () => (error ? { ok: false, error } : undefined),
        },
      ]);

      return renderWithEvents(<Stub initialEntries={[path]} />);
    };

    it.each([undefined, 'There was an error'])('shows error only if action response fails', async (error) => {
      const { user, ...screen } = await setUp(error);

      // Send form so that the fetcher invokes the action
      await user.type(screen.getByLabelText(/^New password/), 'aA123456!');
      await user.type(screen.getByLabelText(/^Repeat password/), 'aA123456!');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      if (error) {
        await expect.element(screen.getByTestId('error-container')).toHaveTextContent(error);
      } else {
        await expect.element(screen.getByTestId('error-container')).not.toBeInTheDocument();
      }
    });
  });
});
