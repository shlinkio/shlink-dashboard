import { render } from '@testing-library/react';
import type { Role } from '../../../app/entities/User';
import { RoleBadge } from '../../../app/routes/users/RoleBadge';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<RoleBadge />', () => {
  const setUp = (role: Role) => render(<RoleBadge role={role} />);
  const testCases = [
    { role: 'admin' as const },
    { role: 'advanced-user' as const },
    { role: 'managed-user' as const },
  ];

  it.each(testCases)('passes a11y checks', ({ role }) => checkAccessibility(setUp(role)));

  it.each(testCases)('renders expected markup', ({ role }) => {
    const { container } = setUp(role);
    expect(container).toMatchSnapshot();
  });
});
