import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTimeoutToggle } from '@shlinkio/shlink-frontend-kit';
import { Button } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import type { useFetcher } from 'react-router';
import type { CHANGE_PASSWORD_ACTION, PROFILE_ACTION } from '../../users/user-profile-actions';

export type ProfileFormProps = PropsWithChildren<{
  fetcher: ReturnType<typeof useFetcher<{ ok: boolean }>>;
  action: typeof PROFILE_ACTION | typeof CHANGE_PASSWORD_ACTION;
}>;

export const ProfileForm: FC<ProfileFormProps> = ({ fetcher, children, action }) => {
  const formAction = useMemo(() => `?${new URLSearchParams({ action }).toString()}`, [action]);
  const { Form, state, data } = fetcher;
  const savingProfile = state === 'submitting';
  const prevStateRef = useRef(state);

  const formRef = useRef<HTMLFormElement>(null);
  const [saved, toggleSaved] = useTimeoutToggle({ delay: 3000 });

  useEffect(() => {
    // If state transitioned from "doing something" to "idle" and the result is valid, reset form
    if (prevStateRef.current !== 'idle' && state === 'idle' && data?.ok) {
      toggleSaved();
      formRef.current?.reset();
    }

    prevStateRef.current = state;
  }, [data, state, toggleSaved]);

  return (
    <Form method="post" action={formAction} className="tw:flex tw:flex-col tw:gap-y-4" ref={formRef}>
      {children}
      <div className="tw:flex tw:justify-end tw:items-center tw:gap-x-4">
        {saved && <FontAwesomeIcon icon={faCheck} />}
        <Button type="submit" className="tw:max-lg:w-full" disabled={savingProfile}>
          {savingProfile ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Form>
  );
};
