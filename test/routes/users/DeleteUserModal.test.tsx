import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { User } from '../../../app/entities/User';
import { DeleteUserModal } from '../../../app/routes/users/DeleteUserModal';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('<DeleteUserModal />', () => {
  const onClose = vi.fn();
  const userMock = fromPartial<User>({ username: 'foo', publicId: 'foo' });
  const setUp = (open = true) => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => <DeleteUserModal open={open} onClose={onClose} userToDelete={userMock} />,
      },
      {
        path: '/manage-users/delete',
        action: () => ({}),
      },
    ]);

    return renderWithEvents(<Stub />);
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { open: true },
    { open: false },
  ])('opens modal if open is true', ({ open }) => {
    setUp(open);

    if (open) {
      expect(screen.getByText(/^Are you sure you want to delete user/)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(/^Are you sure you want to delete user/)).not.toBeInTheDocument();
    }
  });

  it.each([
    { buttonText: 'Close dialog' },
    { buttonText: 'Cancel' },
  ])('closes modal when cancel or close are clicked', async ({ buttonText }) => {
    const { user } = setUp();

    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.queryByLabelText(buttonText) ?? screen.getByText(buttonText));
    expect(onClose).toHaveBeenCalled();
  });

  it('deletes user when confirm is clicked', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Delete user' }));
    expect(onClose).toHaveBeenCalled();
  });
});
