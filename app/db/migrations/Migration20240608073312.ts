import { Migration } from '@mikro-orm/migrations';

export class Migration20240608073312 extends Migration {
  async up(): Promise<void> {
    const kysely = this.getEntityManager().getKysely();

    await kysely.schema
      .createTable('users')
      .addColumn('id', 'bigint', (column) => column.autoIncrement().primaryKey())
      .addColumn('username', 'varchar(255)', (column) => column.notNull().unique())
      .addColumn('password', 'varchar(255)', (column) => column.notNull())
      .addColumn('role', 'varchar(255)', (column) => column.notNull())
      .addColumn('display_name', 'varchar(255)')
      .addColumn('created_at', 'datetime')
      .execute();

    await kysely.schema
      .createTable('settings')
      .addColumn('id', 'bigint', (column) => column.autoIncrement().primaryKey())
      .addColumn('user_id', 'bigint')
      .addUniqueConstraint('IDX_user_settings', ['user_id'])
      .addForeignKeyConstraint('FK_users', ['user_id'], 'users', ['id'], (constraint) => constraint.onDelete('cascade'))
      .execute();

    await kysely.schema
      .createTable('servers')
      .addColumn('id', 'bigint', (column) => column.autoIncrement().primaryKey())
      .addColumn('name', 'varchar(255)', (column) => column.notNull())
      .addColumn('base_url', 'varchar(255)', (column) => column.notNull())
      .addColumn('api_key', 'varchar(255)', (column) => column.notNull())
      .addColumn('public_id', 'varchar(255)', (column) => column.notNull().unique())
      .execute();

    await kysely.schema
      .createTable('user_has_servers')
      .addColumn('id', 'bigint', (column) => column.autoIncrement().primaryKey())
      .addColumn('user_id', 'bigint')
      .addForeignKeyConstraint('FK_users', ['user_id'], 'users', ['id'], (constraint) => constraint.onDelete('cascade'))
      .addColumn('server_id', 'integer', (column) => column.unsigned())
      .addForeignKeyConstraint('FK_servers', ['server_id'], 'servers', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .execute();

    await kysely.schema
      .createTable('tags')
      .addColumn('id', 'bigint', (column) => column.autoIncrement().primaryKey())
      .addColumn('tag', 'varchar(255)', (column) => column.notNull())
      .addColumn('color', 'varchar(255)', (column) => column.notNull())
      .addColumn('user_id', 'bigint')
      .addForeignKeyConstraint('FK_users', ['user_id'], 'users', ['id'], (constraint) => constraint.onDelete('cascade'))
      .addColumn('server_id', 'integer', (column) => column.unsigned())
      .addForeignKeyConstraint('FK_servers', ['server_id'], 'servers', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .addUniqueConstraint('IDX_tag_user_server', ['tag', 'user_id', 'server_id'])
      .execute();
  }

  async down(): Promise<void> {
    const kysely = this.getEntityManager().getKysely();

    await kysely.schema.dropTable('tags').execute();
    await kysely.schema.dropTable('settings').execute();
    await kysely.schema.dropTable('user_has_servers').execute();
    await kysely.schema.dropTable('servers').execute();
    await kysely.schema.dropTable('users').execute();
  }
}
