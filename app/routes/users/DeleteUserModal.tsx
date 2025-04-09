import { CardModal } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';
import { ClientOnly } from '../../common/ClientOnly';
import type { PlainUser } from '../../entities/User';

export type DeleteUserModalProps = {
  /** Represents the user to delete */
  userToDelete?: PlainUser;
  onClose: () => void;
  open: boolean;
};

/**
 * ModalDialog that handles deleting users
 */
export const DeleteUserModal: FC<DeleteUserModalProps> = ({ userToDelete, onClose, open }) => {
  const { submit, state } = useFetcher();
  const confirmDisabled = state !== 'idle';

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
    <ClientOnly>
      <CardModal
        title="Delete user"
        variant="danger"
        size="sm"
        open={open}
        onClose={onClose}
        onConfirm={deleteUser}
        confirmText={confirmDisabled ? 'Deleting...' : 'Delete user'}
        confirmDisabled={confirmDisabled}
      >
        Are you sure you want to delete user <b>{userToDelete?.username}</b>?
      </CardModal>
    </ClientOnly>
  );
};
