const mysql = require('mysql2/promise');

async function addAuthFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'dinett_pos'
  });

  try {
    console.log('🔧 Agregando campos de autenticación...');

    // Agregar campo password
    await connection.execute(`
      ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''
    `);
    console.log('✅ Campo password agregado');

    // Agregar campo last_login
    await connection.execute(`
      ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL
    `);
    console.log('✅ Campo last_login agregado');

    // Actualizar usuarios existentes con contraseña por defecto
    await connection.execute(`
      UPDATE users SET password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2' 
      WHERE password = ''
    `);
    console.log('✅ Contraseñas por defecto asignadas');

    console.log('🎉 Campos de autenticación agregados exitosamente');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Los campos ya existen, continuando...');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await connection.end();
  }
}

addAuthFields(); 