module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dinett_pos',
    multipleStatements: true
  },
  migrations: {
    directory: './src/infrastructure/db/migrations',
    tableName: 'knex_migrations'
  }
}; 