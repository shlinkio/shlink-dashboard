import { Migration } from '@mikro-orm/migrations';

export class Migration20240608073312 extends Migration {
  async up(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();

    await kysley.schema
      .createTable('users')
      .addColumn('id', 'integer', (column) => column.autoIncrement().unsigned().primaryKey())
      .addColumn('username', 'varchar(255)', (column) => column.notNull().unique())
      .addColumn('password', 'varchar(255)', (column) => column.notNull())
      .addColumn('role', 'varchar(255)', (column) => column.notNull())
      .addColumn('display_name', 'varchar(255)')
      .addColumn('created_at', 'datetime')
      .execute();

    await kysley.schema
      .createTable('settings')
      .addColumn('id', 'integer', (column) => column.autoIncrement().unsigned().primaryKey())
      .addColumn('user_id', 'integer', (column) => column.unsigned())
      .addUniqueConstraint('IDX_user_settings', ['user_id'])
      .addForeignKeyConstraint('FK_users', ['user_id'], 'users', ['id'], (constraint) => constraint.onDelete('cascade'))
      .execute();

    await kysley.schema
      .createTable('servers')
      .addColumn('id', 'integer', (column) => column.autoIncrement().unsigned().primaryKey())
      .addColumn('name', 'varchar(255)', (column) => column.notNull())
      .addColumn('base_url', 'varchar(255)', (column) => column.notNull())
      .addColumn('api_key', 'varchar(255)', (column) => column.notNull())
      .addColumn('public_id', 'varchar(255)', (column) => column.notNull().unique())
      .execute();

    await kysley.schema
      .createTable('user_has_servers')
      .addColumn('id', 'integer', (column) => column.autoIncrement().unsigned().primaryKey())
      .addColumn('user_id', 'integer', (column) => column.unsigned())
      .addForeignKeyConstraint('FK_users', ['user_id'], 'users', ['id'], (constraint) => constraint.onDelete('cascade'))
      .addColumn('server_id', 'integer', (column) => column.unsigned())
      .addForeignKeyConstraint('FK_servers', ['server_id'], 'servers', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .execute();

    await kysley.schema
      .createTable('tags')
      .addColumn('id', 'integer', (column) => column.autoIncrement().unsigned().primaryKey())
      .addColumn('tag', 'varchar(255)', (column) => column.notNull())
      .addColumn('color', 'varchar(255)', (column) => column.notNull())
      .addColumn('user_id', 'integer', (column) => column.unsigned())
      .addForeignKeyConstraint('FK_users', ['user_id'], 'users', ['id'], (constraint) => constraint.onDelete('cascade'))
      .addColumn('server_id', 'integer', (column) => column.unsigned())
      .addForeignKeyConstraint('FK_servers', ['server_id'], 'servers', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .addUniqueConstraint('IDX_tag_user_server', ['tag', 'user_id', 'server_id'])
      .execute();
  }

  async down(): Promise<void> {
    const kysley = this.getEntityManager().getKysely();

    await kysley.schema.dropTable('tags').execute();
    await kysley.schema.dropTable('settings').execute();
    await kysley.schema.dropTable('user_has_servers').execute();
    await kysley.schema.dropTable('servers').execute();
    await kysley.schema.dropTable('users').execute();
  }
}
