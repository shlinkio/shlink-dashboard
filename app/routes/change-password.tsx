import { Button, Card } from '@shlinkio/shlink-frontend-kit/tailwind';
import { type ActionFunctionArgs, useFetcher } from 'react-router';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { sessionContext } from '../middleware/middleware.server';
import { ChangePasswordFields } from '../users/components/ChangePasswordFields';
import { UsersService } from '../users/UsersService.server';

export async function action(
  { request, context }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const sessionData = context.get(sessionContext);
  const formData = await request.formData();

  await usersService.editUserTempPassword(sessionData.publicId, formData);
}

export default function ChangePassword() {
  const { Form } = useFetcher();

  return (
    <Layout>
      <Card title="Set your new password">
        <Form method="post">
          <Card.Header>
            <h5>Set your new password</h5>
          </Card.Header>
          <Card.Body className="tw:flex tw:flex-col tw:gap-y-4">
            <div>
              <p>You need to change your temporary password before going forward.</p>
              <p>
                You password must be at least 8-characters long and include a lowercase, an uppercase, a number and a
                special character.
              </p>
            </div>
            <ChangePasswordFields />
          </Card.Body>
          <Card.Footer className="tw:flex tw:justify-end">
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Form>
      </Card>
    </Layout>
  );
}
