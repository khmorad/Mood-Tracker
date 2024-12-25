import { createPool, Pool } from 'mysql2/promise';

interface DBConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

const dbConfig: DBConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'defaultUser',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultDB'
};

export const pool: Pool = createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
