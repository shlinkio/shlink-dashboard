import {
  Button,
  LabelledInput,
  LabelledRevealablePasswordInput,
  SimpleCard,
} from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { PlainServer } from '../../entities/Server';

export type ServerFormFieldsProps = {
  title: string;
  submitText: string;
  disabled?: boolean;

  /** If provided, input values will be initialized with this server */
  server?: PlainServer;
};

export const ServerFormFields: FC<ServerFormFieldsProps> = ({ title, submitText, disabled, server }) => (
  <div className="flex flex-col gap-y-4">
    <SimpleCard title={title} bodyClassName="flex flex-col gap-y-4">
      <LabelledInput
        label="Name"
        name="name"
        disabled={disabled}
        defaultValue={server?.name}
        required
      />
      <LabelledInput
        type="url"
        label="URL"
        name="baseUrl"
        disabled={disabled}
        defaultValue={server?.baseUrl}
        required
      />
      <LabelledRevealablePasswordInput
        label="API key"
        name="apiKey"
        disabled={disabled}
        defaultValue={server?.apiKey}
        required
      />
    </SimpleCard>
    <div className="flex justify-end gap-2">
      <Button variant="secondary" to="/manage-servers/1">Cancel</Button>
      <Button type="submit" disabled={disabled}>{submitText}</Button>
    </div>
  </div>
);
