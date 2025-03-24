import type { FC } from 'react';
import type { User } from '../../entities/User';
import { Button } from '../../fe-kit/Button';
import { LabelledInput } from '../../fe-kit/LabelledInput';
import { LabelledSelect } from '../../fe-kit/LabelledSelect';
import { SimpleCard } from '../../fe-kit/SimpleCard';

export type UserFormFieldsProps = {
  user?: User;
  submitText: string;
  disabled: boolean;
  usernameError?: string;
};

const roles = ['managed-user', 'advanced-user', 'admin'];

export const UserFormFields: FC<UserFormFieldsProps> = ({ submitText, disabled, usernameError, user }) => (
  <div className="tw:flex tw:flex-col tw:gap-y-4">
    <SimpleCard title="Add new user" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
      <LabelledInput
        label="Username"
        name="username"
        required
        disabled={disabled}
        readOnly={!!user}
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
