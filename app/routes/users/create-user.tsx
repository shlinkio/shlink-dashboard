import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { LoaderFunctionArgs } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { Button } from '../../fe-kit/Button';
import { LabelledInput } from '../../fe-kit/LabelledInput';
import { useGoBack } from '../../fe-kit/use-go-back';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }
}

export default function CreateUser() {
  const goBack = useGoBack();

  return (
    <Layout>
      <form method="post" className="tw:flex tw:flex-col tw:gap-y-4">
        <SimpleCard title="Add new user" bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
          <LabelledInput label="Username" name="username" required />
          <LabelledInput label="Display name" name="displayName" required />
        </SimpleCard>
        <div className="tw:flex tw:flex-row-reverse tw:gap-2">
          <Button type="submit">Create user</Button>
          <Button variant="secondary" onClick={goBack}>Cancel</Button>
        </div>
      </form>
    </Layout>
  );
};
