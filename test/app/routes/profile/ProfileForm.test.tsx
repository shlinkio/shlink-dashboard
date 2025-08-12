import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { FC, PropsWithChildren, RefAttributes } from 'react';
import { useState } from 'react';
import type { ProfileFormProps } from '../../../../app/routes/profile/ProfileForm';
import { ProfileForm } from '../../../../app/routes/profile/ProfileForm';
import { PROFILE_ACTION } from '../../../../app/users/user-profile-actions';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/set-up-test';

type Fetcher = ProfileFormProps['fetcher'];
type SetUpOptions = Partial<Pick<Fetcher, 'state' | 'data'>> & {
  newStateAfterRender?: Fetcher['state'];
};

const Form: FC<PropsWithChildren<RefAttributes<HTMLFormElement>>> = ({ children, ref }) => (
  <form ref={ref}>{children}</form>
);

function TestComponent({ newStateAfterRender, state: initialState, data }: SetUpOptions) {
  const [state, setState] = useState(initialState);

  return (
    <>
      <ProfileForm
        action={PROFILE_ACTION}
        fetcher={fromPartial({ Form, state, data })}
      />
      <button
        data-testid="update-state"
        aria-hidden
        onClick={() => newStateAfterRender && setState(newStateAfterRender)}
      />
    </>
  );
}

describe('<ProfileForm />', () => {
  const setUp = async ({ state, data, newStateAfterRender = state }: SetUpOptions = {}) => {
    const renderResult = renderWithEvents(
      <TestComponent state={state} data={data} newStateAfterRender={newStateAfterRender} />,
    );

    if (state !== newStateAfterRender) {
      await renderResult.user.click(screen.getByTestId('update-state'));
    }

    return renderResult;
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { state: 'submitting' as const, buttonText: 'Saving...', expectedDisabled: true },
    { state: 'idle' as const, buttonText: 'Save', expectedDisabled: false },
  ])('disables save button while saving', async ({ state, buttonText, expectedDisabled }) => {
    await setUp({ state });

    if (expectedDisabled) {
      expect(screen.getByRole('button', { name: buttonText, hidden: true })).toBeDisabled();
    } else {
      expect(screen.getByRole('button', { name: buttonText })).not.toBeDisabled();
    }

    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('resets form when transitioning to idle state and everything is valid', async () => {
    const resetForm = vi.spyOn(HTMLFormElement.prototype, 'reset');

    await setUp({
      state: 'submitting',
      newStateAfterRender: 'idle',
      data: { ok: true },
    });

    expect(resetForm).toHaveBeenCalled();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
