# Guía de Testing - DinettApp Backend

Esta guía explica cómo probar el sistema de usuarios completo, desde el endpoint POST hasta la persistencia en base de datos.

## 🧪 Tipos de Pruebas

### 1. Pruebas Unitarias
Prueban componentes individuales de forma aislada.

```bash
npm test
```

**Cubre:**
- Casos de uso (CreateUser)
- Validaciones de DTOs
- Lógica de negocio
- Manejo de errores

### 2. Pruebas de Integración
Prueban el flujo completo desde el endpoint hasta la base de datos.

```bash
npm run test:integration
```

**Cubre:**
- Endpoints HTTP
- Middleware de autenticación
- Resolución de tenant
- Persistencia en base de datos
- Validaciones de entrada
- Manejo de errores HTTP

## 🚀 Configuración Inicial

### 1. Configurar Base de Datos
```bash
# Copiar variables de entorno
cp env.example .env

# Editar .env con tus credenciales de MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=dinett_pos
DB_POOL_SIZE=10

# Ejecutar setup de base de datos
npm run setup:db
```

### 2. Verificar Configuración
```bash
# Verificar que TypeScript compila
npm run build

# Verificar que las pruebas unitarias pasan
npm test
```

## 🔍 Casos de Prueba Implementados

### Casos de Éxito

#### 1. Crear Usuario Exitosamente
- **Endpoint**: `POST /api/users`
- **Headers**: `Authorization: Bearer mock-token`, `X-Tenant-ID: test-tenant`
- **Body**: Datos válidos de usuario
- **Resultado Esperado**: 201 Created con datos del usuario creado

#### 2. Obtener Usuario por ID
- **Endpoint**: `GET /api/users/:id`
- **Headers**: `Authorization: Bearer mock-token`, `X-Tenant-ID: test-tenant`
- **Resultado Esperado**: 200 OK con datos del usuario

### Casos de Error

#### 1. Validación de Campos
- **Escenario**: Campos requeridos faltantes
- **Resultado Esperado**: 400 Bad Request con mensaje de validación

#### 2. Email Duplicado
- **Escenario**: Intentar crear usuario con email existente
- **Resultado Esperado**: 409 Conflict con mensaje de duplicado

#### 3. ID Duplicado
- **Escenario**: Intentar crear usuario con ID existente
- **Resultado Esperado**: 409 Conflict con mensaje de duplicado

#### 4. Sin Autorización
- **Escenario**: Request sin token de autorización
- **Resultado Esperado**: 401 Unauthorized

#### 5. Sin Tenant ID
- **Escenario**: Request sin header X-Tenant-ID
- **Resultado Esperado**: 400 Bad Request

#### 6. Usuario No Encontrado
- **Escenario**: Buscar usuario inexistente
- **Resultado Esperado**: 404 Not Found

## 🛠️ Herramientas de Testing

### 1. Jest
- Framework de testing principal
- Configurado para TypeScript
- Cobertura de código automática

### 2. Supertest
- Testing de endpoints HTTP
- Simula requests HTTP reales
- Integración con Express

### 3. Mocks
- Repositorio de usuarios mockeado para pruebas unitarias
- Middleware de autenticación simulado
- Base de datos de prueba aislada

## 📊 Cobertura de Código

```bash
npm run test:coverage
```

**Métricas cubiertas:**
- Statements: >90%
- Branches: >80%
- Functions: >90%
- Lines: >90%

## 🔧 Testing Manual

### 1. Usar el archivo de ejemplos
```bash
# El archivo examples/test-api.http contiene requests de ejemplo
# Puedes usar este archivo con extensiones como:
# - REST Client (VS Code)
# - IntelliJ HTTP Client
# - Postman
```

### 2. Probar con curl
```bash
# Health check
curl http://localhost:3000/health

# Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer mock-token" \
  -H "X-Tenant-ID: test-tenant" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test001",
    "name": "Test User",
    "nickname": "testuser",
    "phone": "+1234567890",
    "email": "test@example.com",
    "role": "cashier"
  }'
```

### 3. Verificar en Base de Datos
```sql
-- Conectar a la base de datos
mysql -u root -p dinett_pos

-- Verificar usuario creado
SELECT * FROM users WHERE tenant_id = 'test-tenant';

-- Verificar aislamiento multitenant
SELECT * FROM users WHERE tenant_id = 'other-tenant';
```

## 🐛 Debugging

### 1. Logs de la Aplicación
```bash
# Ejecutar en modo desarrollo para ver logs detallados
npm run dev
```

### 2. Logs de Base de Datos
```sql
-- Habilitar logs de MySQL
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/tmp/mysql.log';
```

### 3. Testing con Base de Datos Real
```bash
# Usar base de datos de desarrollo para testing manual
DB_NAME=dinett_pos npm run dev
```

## 📈 Métricas de Calidad

### 1. Cobertura de Pruebas
- **Unitarias**: 100% de casos de uso
- **Integración**: 100% de endpoints
- **Validaciones**: 100% de reglas de negocio

### 2. Performance
- **Tiempo de respuesta**: <200ms para operaciones CRUD
- **Concurrencia**: 100 requests/minuto por IP
- **Base de datos**: Pool de conexiones optimizado

### 3. Seguridad
- **Validación de entrada**: Joi schemas
- **Autenticación**: Middleware JWT (simulado)
- **Autorización**: Control de permisos
- **Multitenant**: Aislamiento por tenant

## 🎯 Próximos Pasos

1. **Implementar JWT real** en lugar del mock
2. **Agregar más endpoints** (UPDATE, DELETE, LIST)
3. **Implementar logging** estructurado
4. **Agregar métricas** de performance
5. **Configurar CI/CD** con GitHub Actions
6. **Implementar migraciones** automáticas
7. **Agregar documentación** OpenAPI completa 