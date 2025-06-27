#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function addUpdatedAtColumn() {
  console.log('🚀 Agregando columna updated_at a la tabla users...');
  
  try {
    // Configurar conexión
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
      dbConfig.password = process.env.DB_PASSWORD;
    }

    // Conectar a MySQL
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a MySQL establecida');

    // Agregar columna updated_at a dinett_pos
    await connection.query('USE dinett_pos');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
      AFTER created_at
    `);
    console.log('✅ Columna updated_at agregada a dinett_pos.users');

    // Agregar columna updated_at a dinett_pos_test
    await connection.query('USE dinett_pos_test');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
      AFTER created_at
    `);
    console.log('✅ Columna updated_at agregada a dinett_pos_test.users');

    await connection.end();
    console.log('🎉 Columna updated_at agregada exitosamente');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  La columna updated_at ya existe en la tabla users');
    } else {
      console.error('❌ Error agregando columna updated_at:', error.message);
      process.exit(1);
    }
  }
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar script
addUpdatedAtColumn(); 