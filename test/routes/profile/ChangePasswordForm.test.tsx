import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { forwardRef, type PropsWithChildren } from 'react';
import { ChangePasswordForm } from '../../../app/routes/profile/ChangePasswordForm';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ChangePasswordForm />', () => {
  const Form = forwardRef<HTMLFormElement, PropsWithChildren>(({ children }, ref) => <form ref={ref}>{children}</form>);
  const setUp = (invalidFields?: Record<string, string>) => render(
    <ChangePasswordForm fetcher={fromPartial({ Form, data: { invalidFields } })} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders expected form fields', () => {
    setUp();

    expect(screen.getByLabelText(/^Current password/)).toBeRequired();
    expect(screen.getByLabelText(/^New password/)).toBeRequired();
    expect(screen.getByLabelText(/^Repeat password/)).toBeRequired();
  });

  it('shows error messages when provided', () => {
    const invalidElements = {
      currentPassword: 'Current password error',
      newPassword: 'New password error',
      repeatPassword: 'Repeat password error',
    };
    setUp(invalidElements);

    expect(screen.getByText(invalidElements.currentPassword)).toBeInTheDocument();
    expect(screen.getByText(invalidElements.newPassword)).toBeInTheDocument();
    expect(screen.getByText(invalidElements.repeatPassword)).toBeInTheDocument();
  });
});
