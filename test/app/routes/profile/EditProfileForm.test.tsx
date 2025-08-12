import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { FC, PropsWithChildren, RefAttributes } from 'react';
import type { SessionData } from '../../../../app/auth/session-context';
import { EditProfileForm } from '../../../../app/routes/profile/EditProfileForm';
import { checkAccessibility } from '../../../__helpers__/accessibility';

describe('<EditProfileForm />', () => {
  const Form: FC<PropsWithChildren<RefAttributes<HTMLFormElement>>> = ({ children, ref }) => (
    <form ref={ref}>{children}</form>
  );
  const setUp = (sessionData: SessionData | null = null) => render(
    <EditProfileForm sessionData={sessionData} fetcher={fromPartial({ Form })} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { sessionData: null, expectedValue: '' },
    { sessionData: {}, expectedValue: '' },
    { sessionData: { displayName: 'John Doe' }, expectedValue: 'John Doe' },
  ])('initializes field with current user display name', ({ sessionData, expectedValue }) => {
    setUp(sessionData ? fromPartial(sessionData) : null);
    expect(screen.getByLabelText('Display name')).toHaveValue(expectedValue);
  });
});
