import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { User } from '../../../app/entities/User';
import type { UserFormFieldsProps } from '../../../app/routes/users/UserFormFields';
import { UserFormFields } from '../../../app/routes/users/UserFormFields';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('<UserFormFields />', () => {
  const setUp = (props: Partial<UserFormFieldsProps> = {}) =>
    renderWithEvents(
      <MemoryRouter>
        <UserFormFields title="Title" submitText="Submit" {...props} />
      </MemoryRouter>,
    );

  it.each([[undefined], [fromPartial<User>({ username: 'foo', role: 'advanced-user' })]])(
    'passes a11y checks',
    (user) => checkAccessibility(setUp({ user })),
  );

  it('disables elements when disabled', async () => {
    const screen = await setUp({ disabled: true });

    await expect.element(screen.getByLabelText(/^Username/)).toBeDisabled();
    await expect.element(screen.getByLabelText(/^Display name/)).toBeDisabled();
    await expect.element(screen.getByLabelText(/^Role/)).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it.each([[undefined], [fromPartial<User>({ username: 'foo', role: 'advanced-user' })]])(
    'sets username as readonly when user is provided',
    async (user) => {
      const screen = await setUp({ user });
      const usernameInput = screen.getByLabelText(/^Username/);

      if (user) {
        await expect.element(usernameInput).toHaveAttribute('readonly');
        await expect.element(usernameInput).not.toHaveAttribute('name');
      } else {
        await expect.element(usernameInput).not.toHaveAttribute('readonly');
        await expect.element(usernameInput).toHaveAttribute('name', 'username');
      }
    },
  );
});
