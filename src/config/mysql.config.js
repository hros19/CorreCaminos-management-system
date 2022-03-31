import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysqldb',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'letmein',
  database: process.env.DB_NAME || 'correcaminosdb',
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 200
});

export default pool;