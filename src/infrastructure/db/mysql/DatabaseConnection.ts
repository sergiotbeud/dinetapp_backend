import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseConnection {
  private pool: mysql.Pool;

  constructor() {
    const dbConfig: any = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'dinett_pos',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10'),
      queueLimit: 0,
    };

    // Solo agregar contraseña si está definida y no está vacía
    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
      dbConfig.password = process.env.DB_PASSWORD;
    }

    this.pool = mysql.createPool(dbConfig);
  }

  async execute(sql: string, values?: any[]): Promise<any> {
    try {
      const [rows] = await this.pool.execute(sql, values);
      return rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async query(sql: string, values?: any[]): Promise<any> {
    try {
      const [rows] = await this.pool.query(sql, values);
      return rows;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.pool.getConnection();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
} 