import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migration1714375230731 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const { type: databaseType } = queryRunner.connection.options;

        await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    unsigned: true,
                    isPrimary: true,
                    // charset: '' // TODO Set proper charset based on database engine
                },
                {
                    name: 'username',
                    type: 'varchar'
                },
                {
                    name: 'password',
                    type: 'varchar'
                },
            ],
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
