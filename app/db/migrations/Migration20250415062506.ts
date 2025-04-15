import { Migration } from '@mikro-orm/migrations';

export class Migration20250415062506 extends Migration {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (users) => {
      users.string('public_id').notNullable().unique();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (users) => {
      users.dropColumn('public_id');
    });
  }
}
