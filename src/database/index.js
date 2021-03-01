import path from 'path';
import knexSetup from 'knex';

import dataHelpers from './helpers';

const dbPath = () => path.resolve(
    ...process.env.SQLITE_FILENAME
        ? [process.cwd(), process.env.SQLITE_FILENAME] // given filename, as found from project's root
        : [__dirname, 'database.sqlite'], // file locted in this folder
);

const knex = knexSetup({
    client: 'sqlite3',
    connection: () => ({
        filename: dbPath(), // TODO: create file if it doesn't exist
    }),
    useNullAsDefault: true,
});

// initialise the database
knex.schema
    .hasTable('urls')
    .then(exists => (
        exists
        ? 'The existing DB file was successfully loaded'
        : knex.schema.createTable('urls', (table) => {
            table.increments('id').primary();
            table.string('shortUrl');
            table.string('longUrl');
            table.integer('creation');
            table.integer('lastUsed');
            table.integer('timesUsed').defaultTo(0);
            table.boolean('active').defaultTo(true);
        })
            .then(() => 'We have created a \'urls\' table')
    ))
    .then(next => console.log(`Done setting up the database from ${dbPath()}:`, next))
    .catch((error) => console.error(`There was an error setting up the database from ${dbPath}: ${error}`));

const urlsTableQueryBuilder = () => knex('urls');
const urlsTableBatchInsert = dataArray => knex.batchInsert('urls', dataArray, 100);

export default {
    knex,
    ...dataHelpers(urlsTableQueryBuilder, urlsTableBatchInsert),
};
