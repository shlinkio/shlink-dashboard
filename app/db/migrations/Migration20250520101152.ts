import { Migration } from '@mikro-orm/migrations';

export class Migration20250520101152 extends Migration {
  override async up(): Promise<void> {
    const kysely = this.getEntityManager().getKysely();

    // Detect target driver via env var used by migrations config. This is reliable
    // when running migrations through the provided CLI which reads migrations.config.ts
    const driver = (process.env.SHLINK_DASHBOARD_DB_DRIVER ?? 'sqlite').toLowerCase();
    const isMicrosoft = driver === 'mssql';

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
