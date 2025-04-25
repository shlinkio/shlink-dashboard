import { Button, LabelledInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { useFetcher } from 'react-router';
import type { SessionData } from '../../auth/session-context';
import { PROFILE_ACTION } from '../../users/user-profile-actions';

const formAction = `?${new URLSearchParams({ action: PROFILE_ACTION }).toString()}`;

export type EditProfileFormProps = {
  sessionData: SessionData | null;
  fetcher: ReturnType<typeof useFetcher>;
};

export const EditProfileForm: FC<EditProfileFormProps> = ({ fetcher, sessionData }) => {
  const { Form: EditProfileForm, ...editProfileFetcher } = fetcher;
  const savingProfile = editProfileFetcher.state === 'submitting';

  return (
    <EditProfileForm method="post" action={formAction} className="tw:flex tw:flex-col tw:gap-y-4">
      <LabelledInput label="Display name" defaultValue={sessionData?.displayName ?? ''} name="displayName" />
      <div className="tw:flex tw:justify-end">
        <Button type="submit" className="tw:max-lg:w-full" disabled={savingProfile}>
          {savingProfile ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </EditProfileForm>
  );
};
