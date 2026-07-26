import { Migration } from '@mikro-orm/migrations';

export class Migration20250520101152 extends Migration {
  override async up(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();
    await kysley.schema
      .alterTable('users')
      .addColumn('temp_password', 'boolean', (column) => column.defaultTo(false).notNull())
      .execute();
  }

  override async down(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();
    await kysley.schema.alterTable('users').dropColumn('temp_password').execute();
  }
}
