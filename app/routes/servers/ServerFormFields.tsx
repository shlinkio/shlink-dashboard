import { Button, LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';

export type ServerFormFieldsProps = {
  title: string;
  submitText: string;
  disabled?: boolean;
};

export const ServerFormFields: FC<ServerFormFieldsProps> = ({ title, submitText, disabled }) => (
  <div className="tw:flex tw:flex-col tw:gap-y-4">
    <SimpleCard title={title} bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
      <LabelledInput
        label="Name"
        name="name"
        disabled={disabled}
        required
      />
      <LabelledInput
        type="url"
        label="URL"
        name="baseUrl"
        disabled={disabled}
        required
      />
      <LabelledInput
        type="password"
        label="API key"
        name="apiKey"
        disabled={disabled}
        required
      />
    </SimpleCard>
    <div className="tw:flex tw:justify-end tw:gap-2">
      <Button variant="secondary" to="/manage-servers/1">Cancel</Button>
      <Button type="submit" disabled={disabled}>{submitText}</Button>
    </div>
  </div>
);
