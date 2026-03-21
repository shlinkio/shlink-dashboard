import { Migration } from '@mikro-orm/migrations';

export class Migration20260117070847 extends Migration {
  override async up(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();
    await kysley.schema
      .alterTable('user_has_servers')
      .addUniqueConstraint('IDX_user_server', ['user_id', 'server_id'])
      .execute();
  }

  override async down(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();
    await kysley.schema
      .alterTable('user_has_servers')
      .dropConstraint('IDX_user_server')
      .execute();
  }
}
