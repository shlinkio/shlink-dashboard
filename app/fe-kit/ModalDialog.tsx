import clsx from 'clsx';
import type { FC, HTMLProps } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { CloseButton } from './CloseButton';
import { LinkButton } from './LinkButton';
import type { Size } from './types';

export type ModalDialogProps = Omit<HTMLProps<HTMLDialogElement>, 'title' | 'size'> & {
  open: boolean;
  variant?: 'default' | 'danger' | 'cover';
  size?: Size | 'xl' | 'full';

  /** Modal header title */
  title: string;
  /** Value to display in confirm button. Defaults to  */
  confirmText?: string;

  /** Invoked when the modal is closed for any reason */
  onClose?: () => void;
  /** Invoked when the modal is closed via confirm button */
  onConfirm?: () => void;
};

export const ModalDialog: FC<ModalDialogProps> = ({
  open,
  variant = 'default',
  size = 'md',
  title,
  confirmText = 'Confirm',
  children,
  onClose,
  onConfirm,
  className,
  ...rest
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
    onClose?.();
  }, [onClose]);
  const confirmAndClose = useCallback(() => {
    closeDialog();
    onConfirm?.();
  }, [closeDialog, onConfirm]);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      closeDialog();
    }
  }, [closeDialog, onClose, open]);

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        'tw:m-auto tw:bg-transparent tw:backdrop:bg-black/50',
        {
          'tw:w-[300px]': size === 'sm',
          'tw:w-[500px]': size === 'md',
          'tw:w-[800px]': size === 'lg',
          'tw:w-[1140px]': size === 'xl',
          'tw:w-full': size === 'full',
        },
        className,
      )}
      {...rest}
    >
      {open && (
        <Card>
          <Card.Header className="tw:flex tw:items-center tw:justify-between">
            <h5 className={clsx({ 'tw:text-danger': variant === 'danger' })}>{title}</h5>
            <CloseButton onClick={closeDialog} />
          </Card.Header>
          <Card.Body>{children}</Card.Body>
          <Card.Footer className="tw:flex tw:flex-row-reverse tw:gap-x-2 tw:items-center tw:py-4">
            {onConfirm && (
              <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={confirmAndClose}>
                {confirmText}
              </Button>
            )}
            <LinkButton onClick={closeDialog}>Cancel</LinkButton>
          </Card.Footer>
        </Card>
      )}
    </dialog>
  );
};
