import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { Layout } from '../../common/Layout';
import { Button } from '../../fe-kit/Button';

export default function CreateUser() {
  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-3">
      <SimpleCard title="Add new user"></SimpleCard>
      <div className="tw:flex tw:flex-row-reverse tw:gap-2">
        <Button>Create user</Button>
        <Button variant="secondary">Cancel</Button>
      </div>
    </Layout>
  );
};
