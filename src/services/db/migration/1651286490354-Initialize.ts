import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initialize1651286490354 implements MigrationInterface {
  name = 'Initialize1651286490354'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`subject\` (\`uri\` varchar(255) NOT NULL, PRIMARY KEY (\`uri\`)) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`predicate\` (\`uri\` varchar(255) NOT NULL, PRIMARY KEY (\`uri\`)) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`object\` (\`uri\` varchar(255) NOT NULL, PRIMARY KEY (\`uri\`)) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`triple\` (
                \`subject\` varchar(255) NOT NULL,
                \`predicate\` varchar(255) NOT NULL,
                \`object\` varchar(255) NOT NULL,
                PRIMARY KEY (\`subject\`, \`predicate\`, \`object\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`inbox\` (
                \`subject\` varchar(255) NOT NULL,
                \`sender\` varchar(255) NOT NULL,
                \`suggestedAt\` timestamp NOT NULL,
                PRIMARY KEY (\`subject\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            ALTER TABLE \`triple\`
            ADD CONSTRAINT \`FK_9807f413e62093c9ed017715a8c\` FOREIGN KEY (\`subject\`) REFERENCES \`subject\`(\`uri\`) ON DELETE CASCADE ON UPDATE CASCADE
        `)
    await queryRunner.query(`
            ALTER TABLE \`triple\`
            ADD CONSTRAINT \`FK_c815bedb42d04732e955fffbedd\` FOREIGN KEY (\`predicate\`) REFERENCES \`predicate\`(\`uri\`) ON DELETE CASCADE ON UPDATE CASCADE
        `)
    await queryRunner.query(`
            ALTER TABLE \`triple\`
            ADD CONSTRAINT \`FK_e2c91f044ac77eb827a4b2a0b00\` FOREIGN KEY (\`object\`) REFERENCES \`object\`(\`uri\`) ON DELETE CASCADE ON UPDATE CASCADE
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`triple\` DROP FOREIGN KEY \`FK_e2c91f044ac77eb827a4b2a0b00\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`triple\` DROP FOREIGN KEY \`FK_c815bedb42d04732e955fffbedd\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`triple\` DROP FOREIGN KEY \`FK_9807f413e62093c9ed017715a8c\`
        `)
    await queryRunner.query(`
            DROP TABLE \`inbox\`
        `)
    await queryRunner.query(`
            DROP TABLE \`triple\`
        `)
    await queryRunner.query(`
            DROP TABLE \`object\`
        `)
    await queryRunner.query(`
            DROP TABLE \`predicate\`
        `)
    await queryRunner.query(`
            DROP TABLE \`subject\`
        `)
  }
}
