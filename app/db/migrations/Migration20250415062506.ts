import { Migration } from '@mikro-orm/migrations';

export class Migration20250415062506 extends Migration {
  override async up(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();
    await kysley.schema
      .alterTable('users')
      .addColumn('public_id', 'varchar(255)', (column) => column.notNull().unique())
      .execute();
  }

  override async down(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();
    await kysley.schema.alterTable('users').dropColumn('public_id').execute();
  }
}
