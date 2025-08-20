import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ServerFormFieldsProps } from '../../../../app/routes/servers/ServerFormFields';
import { ServerFormFields } from '../../../../app/routes/servers/ServerFormFields';
import { checkAccessibility } from '../../../__helpers__/accessibility';

describe('<ServerFormFields />', () => {
  const setUp = (props: Partial<ServerFormFieldsProps> = {}) => render(
    <MemoryRouter>
      <ServerFormFields title="The title" submitText="Save" {...props} />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('can disable all inputs', () => {
    setUp({ disabled: true });

    expect(screen.getByLabelText(/^Name/)).toBeDisabled();
    expect(screen.getByLabelText(/^URL/)).toBeDisabled();
    expect(screen.getByLabelText(/^API key/)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it.each([
    'Hello world',
    'Do something',
    'Cool title',
  ])('can customize title', (title) => {
    setUp({ title });
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it.each([
    'Save',
    'Foo bar',
    'Create',
  ])('can submit text', (submitText) => {
    setUp({ submitText });
    expect(screen.getByRole('button', { name: submitText })).toBeInTheDocument();
  });

  it('initializes fields with provided server', () => {
    setUp({ server: fromPartial({ name: 'initial name', baseUrl: 'initial base url', apiKey: 'initial api key' }) });

    expect(screen.getByLabelText(/^Name/)).toHaveValue('initial name');
    expect(screen.getByLabelText(/^URL/)).toHaveValue('initial base url');
    expect(screen.getByLabelText(/^API key/)).toHaveValue('initial api key');
  });
});
