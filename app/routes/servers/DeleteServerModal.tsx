import { CardModal } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback } from 'react';
import { useFetcher } from 'react-router';
import type { PlainServer } from '../../entities/Server';

export type DeleteServerModalProps = {
  /** Represents the server to delete */
  serverToDelete?: PlainServer;
  onClose: () => void;
  open: boolean;
};

/**
 * ModalDialog that handles deleting servers
 */
export const DeleteServerModal: FC<DeleteServerModalProps> = ({ serverToDelete, onClose, open }) => {
  const { submit, state } = useFetcher();
  const confirmDisabled = state !== 'idle';

  const deleteServer = useCallback(async () => {
    const serverPublicId = serverToDelete?.publicId.toString();
    if (!serverPublicId) {
      return;
    }

    await submit({ serverPublicId }, {
      method: 'POST',
      action: '/manage-servers/delete',
      encType: 'application/json',
    });
    onClose();
  }, [onClose, submit, serverToDelete?.publicId]);

  return (
    <CardModal
      title="Delete server"
      variant="danger"
      size="sm"
      open={open}
      onClose={onClose}
      onConfirm={deleteServer}
      confirmText={confirmDisabled ? 'Deleting...' : 'Delete server'}
      confirmDisabled={confirmDisabled}
    >
      Are you sure you want to delete server <b>{serverToDelete?.name}</b>?
    </CardModal>
  );
};
