import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { Button, LabelledRevealablePasswordInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback , useEffect, useRef } from 'react';
import type { useFetcher } from 'react-router';
import { CHANGE_PASSWORD_ACTION } from '../../users/user-profile-actions';
import type { changePasswordAction } from './change-password-action.server';

const formAction = `?${new URLSearchParams({ action: CHANGE_PASSWORD_ACTION }).toString()}`;

export type ChangePasswordFormProps = {
  fetcher: ReturnType<typeof useFetcher<typeof changePasswordAction>>;
};

export const ChangePasswordForm: FC<ChangePasswordFormProps> = ({ fetcher }) => {
  const { Form, ...changePasswordFetcher } = fetcher;
  const savingPassword = changePasswordFetcher.state === 'submitting';
  const prevStateRef = useRef(changePasswordFetcher.state);

  const formRef = useRef<HTMLFormElement>(null);
  const [saved, toggleSaved] = useTimeoutToggle({ delay: 3000 });
  const dataSaved = useCallback(() => {
    toggleSaved();
    formRef.current?.reset();
  }, [toggleSaved]);

  useEffect(() => {
    // If state transitioned from "doing something" to "idle" and the result is valid, reset form
    if (
      prevStateRef.current !== 'idle' &&
      changePasswordFetcher.state === 'idle' &&
      changePasswordFetcher.data?.ok
    ) {
      dataSaved();
    }

    prevStateRef.current = changePasswordFetcher.state;
  }, [changePasswordFetcher.data, changePasswordFetcher.state, dataSaved]);

  return (
    <Form method="post" action={formAction} className="tw:flex tw:flex-col tw:gap-y-4" ref={formRef}>
      <LabelledRevealablePasswordInput
        label="Current password"
        required
        name="currentPassword"
        error={changePasswordFetcher.data?.invalidFields?.currentPassword}
      />
      <LabelledRevealablePasswordInput
        label="New password"
        name="newPassword"
        required
        minLength={8}
        error={changePasswordFetcher.data?.invalidFields?.newPassword}
      />
      <LabelledRevealablePasswordInput
        label="Repeat password"
        name="repeatPassword"
        required
        minLength={8}
        error={changePasswordFetcher.data?.invalidFields?.repeatPassword}
      />
      <div className="tw:flex tw:justify-end tw:items-center tw:gap-x-4">
        {saved && <FontAwesomeIcon icon={faCheck} />}
        <Button type="submit" className="tw:max-lg:grow" disabled={savingPassword}>
          {savingPassword ? 'Saving...' : 'Save password'}
        </Button>
      </div>
    </Form>
  );
};
