import { fromPartial } from '@total-typescript/shoehorn';
import type { FC, PropsWithChildren, RefAttributes } from 'react';
import { useState } from 'react';
import type { ProfileFormProps } from '../../../app/routes/profile/ProfileForm';
import { ProfileForm } from '../../../app/routes/profile/ProfileForm';
import { PROFILE_ACTION } from '../../../app/users/user-profile-actions';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

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
      <ProfileForm action={PROFILE_ACTION} fetcher={fromPartial({ Form, state, data })} />
      <button
        style={newStateAfterRender ? undefined : { visibility: 'hidden' }}
        // oxlint-disable-next-line jsx-a11y/no-aria-hidden-on-focusable - Used just for the test
        aria-hidden
        data-testid="update-state"
        onClick={() => newStateAfterRender && setState(newStateAfterRender)}
      />
    </>
  );
}

describe('<ProfileForm />', () => {
  const setUp = async ({ state, data, newStateAfterRender = state }: SetUpOptions = {}) => {
    const { user, ...screen } = await renderWithEvents(
      <TestComponent state={state} data={data} newStateAfterRender={newStateAfterRender} />,
    );

    if (state !== newStateAfterRender) {
      await user.click(screen.getByTestId('update-state'));
    }

    return { user, ...screen };
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { state: 'submitting' as const, buttonText: 'Saving...', expectedDisabled: true },
    { state: 'idle' as const, buttonText: 'Save', expectedDisabled: false },
  ])('disables save button while saving', async ({ state, buttonText, expectedDisabled }) => {
    const screen = await setUp({ state });

    if (expectedDisabled) {
      await expect.element(screen.getByRole('button', { name: buttonText, includeHidden: true })).toBeDisabled();
    } else {
      await expect.element(screen.getByRole('button', { name: buttonText })).not.toBeDisabled();
    }

    await expect.element(screen.getByRole('img', { includeHidden: true })).not.toBeInTheDocument();
  });

  it('resets form when transitioning to idle state and everything is valid', async () => {
    const resetForm = vi.spyOn(HTMLFormElement.prototype, 'reset');

    const screen = await setUp({
      state: 'submitting',
      newStateAfterRender: 'idle',
      data: { ok: true },
    });

    expect(resetForm).toHaveBeenCalled();
    await expect.element(screen.getByRole('img', { includeHidden: true })).toBeInTheDocument();
  });
});
