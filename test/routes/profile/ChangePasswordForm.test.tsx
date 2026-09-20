import { fromPartial } from '@total-typescript/shoehorn';
import type { FC, PropsWithChildren, RefAttributes } from 'react';
import { ChangePasswordForm } from '../../../app/routes/profile/ChangePasswordForm';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/set-up-test';

describe('<ChangePasswordForm />', () => {
  const Form: FC<PropsWithChildren<RefAttributes<HTMLFormElement>>> = ({ children, ref }) => (
    <form ref={ref}>{children}</form>
  );
  const setUp = (invalidFields?: Record<string, string>) =>
    render(<ChangePasswordForm fetcher={fromPartial({ Form, data: { invalidFields } })} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected form fields', async () => {
    const screen = await setUp();

    await expect.element(screen.getByLabelText(/^Current password/)).toBeRequired();
    await expect.element(screen.getByLabelText(/^New password/)).toBeRequired();
    await expect.element(screen.getByLabelText(/^Repeat password/)).toBeRequired();
  });

  it('shows error messages when provided', async () => {
    const invalidElements = {
      currentPassword: 'Current password error',
      newPassword: 'New password error',
      repeatPassword: 'Repeat password error',
    };
    const screen = await setUp(invalidElements);

    await expect.element(screen.getByText(invalidElements.currentPassword)).toBeInTheDocument();
    await expect.element(screen.getByText(invalidElements.newPassword)).toBeInTheDocument();
    await expect.element(screen.getByText(invalidElements.repeatPassword)).toBeInTheDocument();
  });
});
