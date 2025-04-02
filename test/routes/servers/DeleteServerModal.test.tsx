import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { type PlainServer } from '../../../app/entities/Server';
import { DeleteServerModal } from '../../../app/routes/servers/DeleteServerModal';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('<DeleteServerModal />', () => {
  const onClose = vi.fn();
  const serverMock: PlainServer = fromPartial({ name: 'The server', publicId: 'abc123' });
  const setUp = (open = true) => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => <DeleteServerModal open={open} onClose={onClose} serverToDelete={serverMock} />,
      },
      {
        path: '/manage-servers/delete',
        action: () => ({}),
      },
    ]);

    return renderWithEvents(<Stub />);
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    { open: true },
    { open: false },
  ])('opens modal if open is true', ({ open }) => {
    setUp(open);

    if (open) {
      expect(screen.getByText(/^Are you sure you want to delete server/)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(/^Are you sure you want to delete server/)).not.toBeInTheDocument();
    }
  });

  it.each([
    { buttonText: 'Close dialog' },
    { buttonText: 'Cancel' },
  ])('closes modal when cancel or close are clicked', async ({ buttonText }) => {
    const { user } = setUp();

    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.queryByLabelText(buttonText) ?? screen.getByText(buttonText));
    expect(onClose).toHaveBeenCalled();
  });

  it('deletes server when confirm is clicked', async () => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Delete server' }));
    expect(onClose).toHaveBeenCalled();
  });
});
