import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { CopyToClipboard } from '../../app/common/CopyToClipboard';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('<CopyToClipboard />', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const navigator = fromPartial<typeof globalThis.navigator>({
    clipboard: { writeText },
  });
  const setUp = () => renderWithEvents(<CopyToClipboard text="The text" navigator_={navigator} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('copies to clipboard when icon is clicked', async () => {
    const { user } = setUp();

    await user.click(screen.getByLabelText('Copy to clipboard'));
    expect(writeText).toHaveBeenCalledWith('The text');
  });

  it('switches active icon after copying to clipboard', async () => {
    const { user } = setUp();

    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('data-icon', 'clone');
    const clickPromise = user.click(screen.getByLabelText('Copy to clipboard'));
    await waitFor(() => expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('data-icon', 'check'));

    await clickPromise;
  });
});
