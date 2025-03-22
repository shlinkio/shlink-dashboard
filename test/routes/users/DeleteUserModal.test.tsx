import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { User } from '../../../app/entities/User';
import { DeleteUserModal } from '../../../app/routes/users/DeleteUserModal';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('<DeleteUserModal />', () => {
  const onClose = vi.fn();
  const userMock = fromPartial<User>({ username: 'foo', id: 'foo' });
  const setUp = (userToDelete?: User) => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => <DeleteUserModal onClose={onClose} userToDelete={userToDelete} />,
      },
      {
        path: '/manage-users/delete',
        action: () => ({}),
      },
    ]);

    return renderWithEvents(<Stub />);
  };

  it('passes a11y checks', () => checkAccessibility(setUp(userMock)));

  it.each([
    { userToDelete: undefined },
    { userToDelete: userMock,
    }])('opens modal if a user is provided', ({ userToDelete }) => {
    setUp(userToDelete);

    if (userToDelete) {
      expect(screen.getByText(/^Are you sure you want to delete user/)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(/^Are you sure you want to delete user/)).not.toBeInTheDocument();
    }
  });

  it.each([
    { buttonText: 'Close dialog' },
    { buttonText: 'Cancel' },
  ])('closes modal when cancel or close are clicked', async ({ buttonText }) => {
    const { user } = setUp(userMock);

    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.queryByLabelText(buttonText) ?? screen.getByText(buttonText));
    expect(onClose).toHaveBeenCalled();
  });

  it('deletes user when confirm is clicked', async () => {
    const { user } = setUp(userMock);
    const button = screen.getAllByText('Delete user').find((element) => element.tagName === 'BUTTON');
    if (!button) {
      throw new Error('Confirm button not found');
    }

    await user.click(button);
    expect(onClose).toHaveBeenCalled();
  });
});
