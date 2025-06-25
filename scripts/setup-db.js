#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Configurando base de datos...');
  
  try {
    // Configurar conexión sin contraseña si no está definida
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
    };

    // Solo agregar contraseña si está definida y no está vacía
    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
      dbConfig.password = process.env.DB_PASSWORD;
    }

    console.log('📋 Configuración de conexión:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password ? '***' : 'sin contraseña'
    });

    // Conectar a MySQL sin especificar base de datos
    const connection = await mysql.createConnection(dbConfig);

    console.log('✅ Conexión a MySQL establecida');

    // Crear base de datos principal
    await connection.execute('CREATE DATABASE IF NOT EXISTS dinett_pos');
    console.log('✅ Base de datos dinett_pos creada');

    // Crear base de datos de pruebas
    await connection.execute('CREATE DATABASE IF NOT EXISTS dinett_pos_test');
    console.log('✅ Base de datos dinett_pos_test creada');

    // Leer y ejecutar migración
    const migrationPath = path.join(__dirname, '../src/infrastructure/db/migrations/001_create_users_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Dividir el SQL en sentencias individuales
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Ejecutar migración en base de datos principal
    await connection.execute('USE dinett_pos');
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('✅ Migración ejecutada en dinett_pos');

    // Ejecutar migración en base de datos de pruebas
    await connection.execute('USE dinett_pos_test');
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log('✅ Migración ejecutada en dinett_pos_test');

    await connection.end();
    console.log('🎉 Configuración de base de datos completada exitosamente');

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
    console.error('💡 Sugerencias:');
    console.error('   - Verifica que MySQL esté corriendo');
    console.error('   - Verifica las credenciales en el archivo .env');
    console.error('   - Si MySQL no tiene contraseña, deja DB_PASSWORD vacío');
    process.exit(1);
  }
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar setup
setupDatabase(); 