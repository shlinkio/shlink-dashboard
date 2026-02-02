import { Migration } from '@mikro-orm/migrations';

export class Migration20260201000000 extends Migration {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (users) => {
      users.string('oidc_subject').nullable().unique();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (users) => {
      users.dropColumn('oidc_subject');
    });
  }
}
