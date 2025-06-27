#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('🚀 Ejecutando migraciones...');
  
  try {
    // Configurar conexión base
    const baseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
    };

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
      baseConfig.password = process.env.DB_PASSWORD;
    }

    console.log('📋 Configuración de conexión:', {
      host: baseConfig.host,
      port: baseConfig.port,
      user: baseConfig.user,
      password: baseConfig.password ? '***' : 'sin contraseña'
    });

    // Lista de migraciones en orden
    const migrations = [
      '001_create_users_table.sql',
      '002_add_auth_fields.sql',
      '003_create_tenants_table.sql',
      '006_create_tenants_table.sql'
    ];

    // Ejecutar migraciones en ambas bases de datos
    const databases = ['dinett_pos', 'dinett_pos_test'];
    
    for (const dbName of databases) {
      console.log(`\n📊 Ejecutando migraciones en ${dbName}...`);
      
      // Crear conexión específica para cada base de datos
      const dbConfig = { ...baseConfig, database: dbName };
      const connection = await mysql.createConnection(dbConfig);
      
      for (const migration of migrations) {
        const migrationPath = path.join(__dirname, '../src/infrastructure/db/migrations', migration);
        
        if (fs.existsSync(migrationPath)) {
          console.log(`  📝 Ejecutando ${migration}...`);
          const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
          
          // Dividir el SQL en sentencias individuales
          const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

          for (const statement of statements) {
            if (statement.trim()) {
              try {
                await connection.query(statement);
              } catch (error) {
                // Ignorar errores de "table already exists" o "column already exists"
                if (!error.message.includes('already exists') && !error.message.includes('Duplicate column name')) {
                  console.log(`    ⚠️  Error en statement: ${error.message}`);
                }
              }
            }
          }
          console.log(`  ✅ ${migration} completada`);
        } else {
          console.log(`  ⚠️  ${migration} no encontrada, saltando...`);
        }
      }
      
      await connection.end();
    }

    console.log('\n🎉 Todas las migraciones ejecutadas exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    process.exit(1);
  }
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar migraciones
runMigrations(); 