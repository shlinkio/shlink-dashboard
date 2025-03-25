import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { User } from '../../../app/entities/User';
import type { UserFormFieldsProps } from '../../../app/routes/users/UserFormFields';
import { UserFormFields } from '../../../app/routes/users/UserFormFields';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('<UserFormFields />', () => {
  const setUp = (props: Partial<UserFormFieldsProps> = {}) => renderWithEvents(
    <MemoryRouter>
      <UserFormFields title="Title" submitText="Submit" {...props} />
    </MemoryRouter>,
  );

  it.each([
    [undefined],
    [fromPartial<User>({ username: 'foo', role: 'advanced-user' })],
  ])('passes a11y checks', (user) => checkAccessibility(setUp({ user })));

  it('disables elements when disabled', () => {
    setUp({ disabled: true });

    expect(screen.getByLabelText(/^Username/)).toBeDisabled();
    expect(screen.getByLabelText(/^Display name/)).toBeDisabled();
    expect(screen.getByLabelText(/^Role/)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it.each([
    [undefined],
    [fromPartial<User>({ username: 'foo', role: 'advanced-user' })],
  ])('sets username as readonly when user is provided', (user) => {
    setUp({ user });
    const usernameInput = screen.getByLabelText(/^Username/);

    if (user) {
      expect(usernameInput).toHaveAttribute('readonly');
      expect(usernameInput).not.toHaveAttribute('name');
    } else {
      expect(usernameInput).not.toHaveAttribute('readonly');
      expect(usernameInput).toHaveAttribute('name', 'username');
    }
  });
});
