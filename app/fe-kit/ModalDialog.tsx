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

type CommonModalDialogProps = {
  open: boolean;
  size?: Size | 'xl' | 'full';

  /** Modal header title */
  title: string;
  /** Invoked when the modal is closed for any reason */
  onClose?: () => void;
};

type CoverModalDialogProps = CommonModalDialogProps & {
  /**
   * Cover dialogs have a body that span the whole dialog, and no buttons.
   * The header overlaps the body with semi-transparent background.
   */
  variant: 'cover';
};

type RegularModalDialogProps = CommonModalDialogProps & {
  /** Danger dialogs use danger variants in title and confirm button */
  variant?: 'default' | 'danger'
  /** Value to display in confirm button. Defaults to 'Confirm' */
  confirmText?: string;
  /** Invoked when the modal is closed via confirm button */
  onConfirm?: () => void;
};

export type ModalDialogProps = Omit<HTMLProps<HTMLDialogElement>, 'title' | 'size'> & (
  CoverModalDialogProps | RegularModalDialogProps
);

export const ModalDialog: FC<ModalDialogProps> = ({
  open,
  variant = 'default',
  size = 'md',
  title,
  children,
  className,
  ...rest
}) => {
  const { onConfirm, confirmText = 'Confirm', ...restDialogProps } = 'onConfirm' in rest ? rest : {
    ...rest,
    onConfirm: undefined,
    confirmText: undefined,
  };
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeDialog = useCallback(() => dialogRef.current?.close(), []);
  const confirmAndClose = useCallback(() => {
    onConfirm?.();
    closeDialog();
  }, [closeDialog, onConfirm]);

  useEffect(() => {
    const body = document.querySelector('body')!;
    const originalOverflow = body.style.overflow;
    const originalPadding = body.style.paddingRight;

    if (open) {
      // When opened, hide body scroll and compensate for the scrollbar if present
      body.style.overflow = 'hidden';
      if (body.scrollHeight > body.clientHeight) {
        // TODO Calculate the offset instead of hardcoding 15px
        body.style.paddingRight = '15px';
      }
      dialogRef.current?.showModal();
    } else {
      closeDialog();
    }

    return () => {
      // Restore original body overflow and padding on cleanup
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPadding;
    };
  }, [closeDialog, open]);

  return (
    <dialog
      ref={dialogRef}
      className={clsx(
        'tw:bg-transparent tw:backdrop:bg-black/50',
        {
          'tw:flex tw:w-screen tw:h-screen tw:max-w-screen tw:max-h-screen tw:px-4': open,
        },
        className,
      )}
      {...restDialogProps}
    >
      {open && (
        <Card className={clsx(
          'tw:m-auto tw:w-full',
          {
            'tw:md:w-sm': size === 'sm',
            'tw:md:w-lg': size === 'md',
            'tw:md:w-4xl': size === 'lg',
            'tw:md:w-6xl': size === 'xl',
            'tw:w-full': size === 'full',
          },
        )}>
          <Card.Header className="tw:flex tw:items-center tw:justify-between tw:sticky tw:top-0">
            <h5 className={clsx({ 'tw:text-danger': variant === 'danger' })}>{title}</h5>
            <CloseButton onClick={closeDialog} label="Close dialog" />
          </Card.Header>
          <Card.Body>{children}</Card.Body>
          <Card.Footer className="tw:flex tw:flex-row-reverse tw:gap-x-2 tw:items-center tw:py-4 tw:sticky tw:bottom-0">
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
