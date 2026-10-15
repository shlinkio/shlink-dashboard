import type { Role } from '../../../app/entities/User';
import { RoleBadge } from '../../../app/routes/users/RoleBadge';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { render } from '../../__helpers__/set-up-test';

describe('<RoleBadge />', () => {
  const setUp = (role: Role) => render(<RoleBadge role={role} />);
  const testCases = [{ role: 'admin' as const }, { role: 'advanced-user' as const }, { role: 'managed-user' as const }];

  it.each(testCases)('passes a11y checks', ({ role }) => checkAccessibility(setUp(role)));

  it.each(testCases)('renders expected markup', async ({ role }) => {
    const { container } = await setUp(role);
    expect(container).toMatchSnapshot();
  });
});
