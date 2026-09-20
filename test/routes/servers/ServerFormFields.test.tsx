import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ServerFormFieldsProps } from '../../../app/routes/servers/ServerFormFields';
import { ServerFormFields } from '../../../app/routes/servers/ServerFormFields';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/set-up-test';

describe('<ServerFormFields />', () => {
  const setUp = (props: Partial<ServerFormFieldsProps> = {}) =>
    render(
      <MemoryRouter>
        <ServerFormFields title="The title" submitText="Save" {...props} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('can disable all inputs', async () => {
    const screen = await setUp({ disabled: true });

    await expect.element(screen.getByLabelText(/^Name/)).toBeDisabled();
    await expect.element(screen.getByLabelText(/^URL/)).toBeDisabled();
    await expect.element(screen.getByLabelText(/^API key/)).toBeDisabled();
    await expect.element(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it.each(['Hello world', 'Do something', 'Cool title'])('can customize title', async (title) => {
    const screen = await setUp({ title });
    await expect.element(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it.each(['Save', 'Foo bar', 'Create'])('can submit text', async (submitText) => {
    const screen = await setUp({ submitText });
    await expect.element(screen.getByRole('button', { name: submitText })).toBeInTheDocument();
  });

  it('initializes fields with provided server', async () => {
    const screen = await setUp({
      server: fromPartial({ name: 'initial name', baseUrl: 'initial base url', apiKey: 'initial api key' }),
    });

    await expect.element(screen.getByLabelText(/^Name/)).toHaveValue('initial name');
    await expect.element(screen.getByLabelText(/^URL/)).toHaveValue('initial base url');
    await expect.element(screen.getByLabelText(/^API key/)).toHaveValue('initial api key');
  });
});
