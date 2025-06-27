# DinettApp POS API - Sistema Multitenant

Backend en Node.js para un sistema POS monolítico multitenant con Clean Architecture, MySQL y principios SOLID.

## 🏗️ Arquitectura

### Clean Architecture
- **Domain**: Entidades y reglas de negocio
- **Application**: Casos de uso y servicios
- **Infrastructure**: Base de datos, web, sesiones
- **Interfaces**: Controladores, rutas, middleware

### Sistema Multitenant
El sistema implementa un modelo **multitenant por base de datos compartida** donde:

- Cada **tenant** representa una **tienda independiente**
- Los datos se **aislan** mediante `tenant_id` en todas las tablas
- La **autenticación** se basa en sesiones con validación de tenant
- Cada tenant puede tener **múltiples usuarios** con diferentes roles

## 🏪 Gestión de Tenants

### Estructura de un Tenant
```json
{
  "id": "paul-store",
  "name": "Tienda de Paul",
  "businessName": "Paul's Electronics Store",
  "ownerName": "Paul Johnson",
  "ownerEmail": "paul@paulstore.com",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "taxId": "TAX123456",
  "subscriptionPlan": "basic",
  "status": "active"
}
```

### Estados de Tenant
- **`active`**: Tenant funcionando normalmente
- **`suspended`**: Tenant temporalmente suspendido
- **`cancelled`**: Tenant cancelado permanentemente

### API de Tenants

#### Crear Tenant
```http
POST /api/tenants
Content-Type: application/json

{
  "id": "paul-store",
  "name": "Tienda de Paul",
  "businessName": "Paul's Electronics Store",
  "ownerName": "Paul Johnson",
  "ownerEmail": "paul@paulstore.com",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "taxId": "TAX123456",
  "subscriptionPlan": "basic"
}
```

#### Obtener Tenant
```http
GET /api/tenants/{tenantId}
```

#### Listar Tenants
```http
GET /api/tenants
```

#### Actualizar Tenant
```http
PUT /api/tenants/{tenantId}
Content-Type: application/json

{
  "name": "Tienda Actualizada",
  "phone": "+1111111111"
}
```

#### Suspender/Activar Tenant
```http
POST /api/tenants/{tenantId}/suspend
POST /api/tenants/{tenantId}/activate
```

## 🔐 Autenticación y Autorización

### Sistema de Sesiones
- **Sesiones en memoria** (estilo PHP)
- **Sin costos** de infraestructura
- **Validación automática** de tenant activo

### Flujo de Autenticación

#### 1. Login
```http
POST /api/auth/login
X-Tenant-ID: paul-store
Content-Type: application/json

{
  "email": "admin@paulstore.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "sessionId": "abc123-def456-ghi789",
    "user": {
      "id": "user001",
      "email": "admin@paulstore.com",
      "tenantId": "paul-store"
    }
  }
}
```

#### 2. Acceso a Endpoints Protegidos
```http
GET /api/users
X-Session-ID: abc123-def456-ghi789
X-Tenant-ID: paul-store
```

#### 3. Logout
```http
POST /api/auth/logout
X-Session-ID: abc123-def456-ghi789
```

### Validación de Tenant
El middleware `resolveTenant` valida:
- ✅ Tenant existe en la base de datos
- ✅ Tenant está en estado `active`
- ✅ Tenant coincide con la sesión del usuario

## 🌐 Flujo desde Frontend

### Opción 1: Subdominio por Tienda
```
https://paul-store.dinettapp.com/login
https://david-store.dinettapp.com/login
```

### Opción 2: Subdirectorio
```
https://app.dinettapp.com/paul-store/login
https://app.dinettapp.com/david-store/login
```

### Detección Automática del Tenant
```javascript
// Frontend - Detectar tenant automáticamente
function getTenantFromURL() {
  const hostname = window.location.hostname;
  
  // Opción 1: Subdominio
  if (hostname.includes('.')) {
    const subdomain = hostname.split('.')[0];
    return subdomain;
  }
  
  // Opción 2: Subdirectorio
  const path = window.location.pathname;
  const match = path.match(/^\/([^\/]+)/);
  return match ? match[1] : null;
}

// Usar en login
const tenantId = getTenantFromURL();
```

## 📊 Estructura de Base de Datos

### Tabla `tenants`
```sql
CREATE TABLE tenants (
  id VARCHAR(50) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  tax_id VARCHAR(50),
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  status ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla `users` (con tenant_id)
```sql
CREATE TABLE users (
  id VARCHAR(50) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  -- ... otros campos
  PRIMARY KEY (id, tenant_id),
  UNIQUE KEY unique_email_tenant (email, tenant_id)
);
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### 1. Clonar y Instalar
```bash
git clone <repository>
cd dinetapp_backend
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dinettapp

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE dinettapp;
USE dinettapp;
exit;

# Ejecutar migraciones
npm run migrate
```

### 4. Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Cobertura
npm run test:coverage
```

### 5. Iniciar Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📋 Endpoints Disponibles

### Health Check
- `GET /health` - Estado del servidor

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Gestión de Tenants
- `POST /api/tenants` - Crear tenant
- `GET /api/tenants` - Listar tenants
- `GET /api/tenants/:id` - Obtener tenant
- `PUT /api/tenants/:id` - Actualizar tenant
- `DELETE /api/tenants/:id` - Eliminar tenant
- `POST /api/tenants/:id/activate` - Activar tenant
- `POST /api/tenants/:id/suspend` - Suspender tenant

### Gestión de Usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users` - Buscar usuarios
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🧪 Testing

### Pruebas Unitarias
```bash
npm run test
```

### Pruebas de Integración
```bash
npm run test:integration
```

### Cobertura
```bash
npm run test:coverage
```

## 📚 Documentación API

La documentación interactiva está disponible en:
```
http://localhost:3000/api-docs
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run build        # Compilar TypeScript
npm run start        # Servidor de producción

# Testing
npm run test         # Tests unitarios
npm run test:watch   # Tests en modo watch
npm run test:integration  # Tests de integración
npm run test:coverage     # Cobertura de tests

# Base de datos
npm run migrate      # Ejecutar migraciones
npm run migrate:make # Crear nueva migración
npm run db:seed      # Poblar base de datos
npm run db:reset     # Resetear base de datos

# Linting
npm run lint         # Verificar código
npm run lint:fix     # Corregir código automáticamente
```

## 🏗️ Estructura del Proyecto

```
src/
├── application/           # Capa de aplicación
│   ├── dtos/             # Data Transfer Objects
│   ├── services/         # Servicios de aplicación
│   └── use-cases/        # Casos de uso
├── domain/               # Capa de dominio
│   └── entities/         # Entidades de negocio
├── infrastructure/       # Capa de infraestructura
│   ├── db/              # Base de datos
│   │   ├── migrations/  # Migraciones
│   │   └── mysql/       # Repositorios MySQL
│   ├── session/         # Gestión de sesiones
│   └── web/             # Controladores web
└── interfaces/          # Capa de interfaces
    ├── http/            # Rutas HTTP
    └── middleware/      # Middleware
```

## 🔒 Seguridad

### Validaciones Implementadas
- ✅ **Validación de tenant activo** en cada request
- ✅ **Aislamiento de datos** por tenant
- ✅ **Validación de sesiones** en memoria
- ✅ **Rate limiting** por IP
- ✅ **Helmet** para headers de seguridad
- ✅ **CORS** configurado
- ✅ **Validación de entrada** en todos los endpoints

### Headers de Seguridad
- `X-Session-ID`: ID de sesión válida
- `X-Tenant-ID`: ID de tenant activo
- `Content-Type`: application/json

## 📈 Escalabilidad

### Ventajas del Modelo Multitenant
- ✅ **Aislamiento total** entre tiendas
- ✅ **Escalabilidad horizontal** fácil
- ✅ **Gestión centralizada** de tenants
- ✅ **Costos reducidos** de infraestructura
- ✅ **Actualizaciones simultáneas** para todos los tenants

### Consideraciones de Rendimiento
- **Índices optimizados** en `tenant_id`
- **Queries filtradas** automáticamente por tenant
- **Sesiones en memoria** para respuesta rápida
- **Rate limiting** para prevenir abuso

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@dinettapp.com
- 📖 Documentación: [docs.dinettapp.com](https://docs.dinettapp.com)
- 🐛 Issues: [GitHub Issues](https://github.com/dinettapp/backend/issues) 