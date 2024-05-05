import type { MigrationInterface, QueryRunner, TableColumnOptions } from 'typeorm';
import { Table, TableForeignKey } from 'typeorm';

function idColumn(): TableColumnOptions {
  return {
    name: 'id',
    type: 'bigint',
    unsigned: true,
    isPrimary: true,
    // charset: '' // TODO Set proper charset based on database engine
  };
}

function userIdFK(): TableForeignKey {
  return new TableForeignKey({
    columnNames: ['user_id'],
    referencedColumnNames: ['id'],
    referencedTableName: 'users',
    onDelete: 'CASCADE',
  });
}

export class Migration1714375230731 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // const { type: databaseType } = queryRunner.connection.options;

    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        idColumn(),
        {
          name: 'username',
          type: 'varchar',
        },
        {
          name: 'password',
          type: 'varchar',
        },
        {
          name: 'role',
          type: 'varchar',
        },
      ],
    }));

    await queryRunner.createTable(new Table({
      name: 'tags',
      columns: [
        idColumn(),
        {
          name: 'tag',
          type: 'varchar',
        },
        {
          name: 'color',
          type: 'varchar',
        },
        {
          name: 'user_id',
          type: 'bigint',
          unsigned: true,
        },
      ],
    }));
    await queryRunner.createForeignKey('tags', userIdFK());

    await queryRunner.createTable(new Table({
      name: 'settings',
      columns: [
        idColumn(),
        {
          name: 'user_id',
          type: 'bigint',
          unsigned: true,
        },
        {
          name: 'settings',
          type: 'json', // TODO Use jsonb for postgres
        },
      ],
    }));
    await queryRunner.createForeignKey('settings', userIdFK());

    await queryRunner.createTable(new Table({
      name: 'servers',
      columns: [
        idColumn(),
        {
          name: 'base_url',
          type: 'varchar',
        },
        {
          name: 'api_key',
          type: 'varchar',
        },
        {
          name: 'public_id',
          type: 'varchar',
        },
      ],
    }));
    await queryRunner.createTable(new Table({
      name: 'user_has_servers',
      columns: [
        idColumn(),
        {
          name: 'user_id',
          type: 'bigint',
          unsigned: true,
        },
        {
          name: 'server_id',
          type: 'bigint',
          unsigned: true,
        },
      ],
    }));
    await queryRunner.createForeignKey('user_has_servers', userIdFK());
    await queryRunner.createForeignKey('user_has_servers', new TableForeignKey({
      columnNames: ['server_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'servers',
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tags');
    await queryRunner.dropTable('settings');
    await queryRunner.dropTable('user_has_servers');
    await queryRunner.dropTable('servers');
    await queryRunner.dropTable('users');
  }
}
