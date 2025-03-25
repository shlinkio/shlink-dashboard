import type { FC } from 'react';
import type { User } from '../../entities/User';
import { Button } from '../../fe-kit/Button';
import { LabelledInput } from '../../fe-kit/LabelledInput';
import { LabelledSelect } from '../../fe-kit/LabelledSelect';
import { SimpleCard } from '../../fe-kit/SimpleCard';

export type UserFormFieldsProps = {
  title: string;
  submitText: string;
  disabled?: boolean;
  usernameError?: string;

  /** If provided, input values will be initialized with this user, and the username field will become readonly */
  user?: User;
};

const roles = ['managed-user', 'advanced-user', 'admin'];

export const UserFormFields: FC<UserFormFieldsProps> = (
  { title, submitText, disabled = false, usernameError, user },
) => {
  const userIsReadonly = !!user;

  return (
    <div className="tw:flex tw:flex-col tw:gap-y-4">
      <SimpleCard title={title} bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
        <LabelledInput
          label="Username"
          // When username is readonly, do not set a name, so that it is not sent with the rest of the form
          name={userIsReadonly ? undefined : 'username'}
          readOnly={userIsReadonly}
          disabled={disabled}
          required
          error={usernameError}
          defaultValue={user?.username}
        />
        <LabelledInput
          label="Display name"
          name="displayName"
          disabled={disabled}
          defaultValue={user?.displayName ?? undefined}
          maxLength={255}
        />
        <LabelledSelect label="Role" name="role" required disabled={disabled} defaultValue={user?.role}>
          {roles.map((role) => <option value={role} key={role}>{role.replaceAll('-', ' ')}</option>)}
        </LabelledSelect>
      </SimpleCard>
      <div className="tw:flex tw:flex-row-reverse tw:gap-2">
        <Button type="submit" disabled={disabled}>{submitText}</Button>
        <Button variant="secondary" to="/manage-users/1">Cancel</Button>
      </div>
    </div>
  );
};
