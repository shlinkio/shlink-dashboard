import { createRoutesStub } from 'react-router';
import { page as screen } from 'vitest/browser';
import ChangePassword from '../../app/routes/change-password';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('change-password', () => {
  describe('<ChangePassword />', () => {
    const setUp = async (error?: string) => {
      const path = '/change-password';
      const Stub = createRoutesStub([
        {
          path,
          Component: ChangePassword,
          HydrateFallback: () => null,
          action: () => (error ? { ok: false, error } : undefined),
        },
      ]);

      const renderResult = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.getByText(/^You need to change your temporary password/).findElement();

      return renderResult;
    };

    it.each([undefined, 'There was an error'])('shows error only if action response fails', async (error) => {
      const { user } = await setUp(error);

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
