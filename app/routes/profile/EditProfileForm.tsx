import { LabelledInput } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import type { useFetcher } from 'react-router';
import type { SessionData } from '../../auth/session-context';
import { PROFILE_ACTION } from '../../users/user-profile-actions';
import type { editProfileAction } from './edit-profile-action.server';
import { ProfileForm } from './ProfileForm';

export type EditProfileFormProps = {
  sessionData: SessionData | null;
  fetcher: ReturnType<typeof useFetcher<typeof editProfileAction>>;
};

export const EditProfileForm: FC<EditProfileFormProps> = ({ fetcher, sessionData }) => (
  <ProfileForm fetcher={fetcher} action={PROFILE_ACTION}>
    <LabelledInput label="Display name" defaultValue={sessionData?.displayName ?? ''} name="displayName" />
  </ProfileForm>
);
