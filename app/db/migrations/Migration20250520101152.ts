import { Migration } from '@mikro-orm/migrations';

export class Migration20250520101152 extends Migration {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (users) => {
      users.boolean('temp_password').notNullable().defaultTo(false);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (users) => {
      users.dropColumn('temp_password');
    });
  }
}
