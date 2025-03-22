import type { FC } from 'react';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';
import type { User } from '../../entities/User';
import { ModalDialog } from '../../fe-kit/ModalDialog';

export type DeleteUserModalProps = {
  /** Represents the user to delete. The modal is closed while it is `undefined` */
  userToDelete?: User;
  onClose: () => void;
};

/**
 * ModalDialog that handles deleting users
 */
export const DeleteUserModal: FC<DeleteUserModalProps> = ({ userToDelete, onClose }) => {
  const { submit, state } = useFetcher();
  const deleteUser = useCallback(async () => {
    const userId = userToDelete?.id.toString();
    if (!userId) {
      return;
    }

    await submit({ userId }, {
      method: 'POST',
      action: '/manage-users/delete',
      encType: 'application/json',
    });
    onClose();
  }, [onClose, submit, userToDelete?.id]);

  return (
    <ModalDialog
      title="Delete user"
      variant="danger"
      size="sm"
      open={!!userToDelete}
      onClose={onClose}
      onConfirm={deleteUser}
      confirmText={state === 'submitting' ? 'Deleting...' : 'Delete user'}
    >
      Are you sure you want to delete user <b>{userToDelete?.username}</b>?
    </ModalDialog>
  );
};
