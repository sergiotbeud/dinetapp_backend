-- Migración para agregar campos de autenticación
-- Agregar campo password para almacenar hash de contraseña
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';

-- Agregar campo last_login para registrar último acceso
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;

-- Actualizar usuarios existentes con contraseña por defecto (cambiar en producción)
UPDATE users SET password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2' WHERE password = ''; 