import { Migration } from '@mikro-orm/migrations';
import type { ColumnDefinitionBuilder } from 'kysely';

export class Migration20240608073312 extends Migration {
  async up(): Promise<void> {
    const kysely = this.getEntityManager().getKysely();

    const driverName = this.getEntityManager().getDriver().constructor.name.toLowerCase();
    const isPostgres = driverName.includes('postgres');
    const isMysql = driverName.includes('mysql') || driverName.includes('mariadb');
    const isSqlite = driverName.includes('sqlite');
    const isMicrosoft = driverName.includes('mssql');

    const idType = isPostgres ? 'bigserial' : isSqlite ? 'integer' : 'bigint';
    const idColBuilder = (column: ColumnDefinitionBuilder) => {
      if (isPostgres) {
        // In postgres, autoincrement is implicit by the bigserial type
        return column.primaryKey();
      }
      if (isMicrosoft) {
        return column.identity().primaryKey();
      }

      return column.autoIncrement().primaryKey();
    };
    const fkType = isSqlite ? 'integer' : 'bigint';
    const dateType = isPostgres ? 'timestamp' : 'datetime';
    const jsonType = isMicrosoft ? 'text' : 'json';

    await kysely.schema
      .createTable('users')
      .addColumn('id', idType, idColBuilder)
      .addColumn('username', 'varchar(255)', (column) => column.notNull().unique())
      .addColumn('password', 'varchar(255)', (column) => column.notNull())
      .addColumn('role', 'varchar(255)', (column) => column.notNull())
      .addColumn('display_name', 'varchar(255)')
      .addColumn('created_at', dateType)
      .execute();

    await kysely.schema
      .createTable('settings')
      .addColumn('id', idType, idColBuilder)
      .addColumn('user_id', fkType)
      .addColumn('settings', jsonType)
      .addUniqueConstraint('IDX_user_settings', ['user_id'])
      .addForeignKeyConstraint('FK_setting_has_users', ['user_id'], 'users', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .execute();

    await kysely.schema
      .createTable('servers')
      .addColumn('id', idType, idColBuilder)
      .addColumn('name', 'varchar(255)', (column) => column.notNull())
      .addColumn('base_url', 'varchar(255)', (column) => column.notNull())
      .addColumn('api_key', 'varchar(255)', (column) => column.notNull())
      .addColumn('public_id', 'varchar(255)', (column) => column.notNull().unique())
      .execute();

    await kysely.schema
      .createTable('user_has_servers')
      .addColumn('id', idType, idColBuilder)
      .addColumn('user_id', fkType)
      .addForeignKeyConstraint('FK_servers_in_users', ['user_id'], 'users', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .addColumn('server_id', fkType, (column) => (isMysql ? column : column))
      .addForeignKeyConstraint('FK_users_in_servers', ['server_id'], 'servers', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .execute();

    await kysely.schema
      .createTable('tags')
      .addColumn('id', idType, idColBuilder)
      .addColumn('tag', 'varchar(255)', (column) => column.notNull())
      .addColumn('color', 'varchar(255)', (column) => column.notNull())
      .addColumn('user_id', fkType)
      .addForeignKeyConstraint('FK_tag_has_users', ['user_id'], 'users', ['id'], (constraint) =>
        constraint.onDelete('cascade'),
      )
      .addColumn('server_id', fkType, (column) => (isMysql ? column : column))
      .addForeignKeyConstraint('FK_tag_has_servers', ['server_id'], 'servers', ['id'], (constraint) =>
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

  // isTransactional(): boolean {
  //   return false;
  // }
}
