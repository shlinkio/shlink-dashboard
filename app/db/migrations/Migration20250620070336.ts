import { Migration } from '@mikro-orm/migrations';

/**
 * Create the initial admin:admin user, which password needs to be changed on first login
 */
export class Migration20250620070336 extends Migration {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex('users').insert({
      username: 'admin',
      // Hash for 'admin'
      password: '$argon2id$v=19$m=65536,t=3,p=4$AKRD5JP/xCa70Cwm67ZkEA$eA0dVlWkcUr4LuEsVG/wfuEdKJQkNjAD4oW2zk4a3Jg',
      role: 'admin',
      public_id: crypto.randomUUID(),
      created_at: new Date(),
      temp_password: true,
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex('users').where({ username: 'admin' }).limit(1).delete();
  }
}
