import { Migration } from '@mikro-orm/migrations';

export class Migration20250520101152 extends Migration {
  override async up(): Promise<void> {
    const kysely = this.getEntityManager().getKysely();

    const driverName = this.getEntityManager().getDriver().constructor.name.toLowerCase();
    const isMicrosoft = driverName.includes('mssql');

    await kysely.schema
      .alterTable('users')
      .addColumn('temp_password', isMicrosoft ? 'smallint' : 'boolean', (column) =>
        column.defaultTo(isMicrosoft ? 0 : false).notNull(),
      )
      .execute();
  }

  override async down(): Promise<void> {
    const kysely = this.getEntityManager().getKysely();
    await kysely.schema.alterTable('users').dropColumn('temp_password').execute();
  }
}
