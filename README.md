# DinettApp Backend - Sistema POS Multitenant

Sistema de Punto de Venta (POS) monolítico con soporte multitenant, construido con Node.js, Clean Architecture, MySQL y principios SOLID.

## 🚀 Características

- ✅ Clean Architecture
- ✅ Soporte Multitenant
- ✅ Base de datos MySQL
- ✅ Validaciones robustas
- ✅ Control de acceso basado en roles
- ✅ Pruebas unitarias e integración
- ✅ Documentación API con Swagger
- ✅ Rate limiting y seguridad
- ✅ Listo para producción

## 📋 Prerrequisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd dinetapp_backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE dinett_pos;
CREATE DATABASE dinett_pos_test;

# Ejecutar migraciones
mysql -u root -p dinett_pos < src/infrastructure/db/migrations/001_create_users_table.sql
```

5. **Ejecutar migraciones de prueba**
```bash
mysql -u root -p dinett_pos_test < src/infrastructure/db/migrations/001_create_users_table.sql
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 🧪 Pruebas

### Pruebas unitarias
```bash
npm test
```

### Pruebas de integración
```bash
npm run test:integration
```

### Cobertura de código
```bash
npm run test:coverage
```

## 📚 API Documentation

Una vez que el servidor esté corriendo, puedes acceder a la documentación de la API en:

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🔧 Endpoints

### Usuarios

#### POST /api/users
Crear un nuevo usuario

**Headers requeridos:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>`

**Body:**
```json
{
  "id": "user123",
  "name": "John Doe",
  "nickname": "johndoe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "role": "cashier"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user123",
    "name": "John Doe",
    "nickname": "johndoe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "role": "cashier",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "active": true,
    "tenantId": "tenant123"
  }
}
```

#### GET /api/users/:id
Obtener un usuario por ID

**Headers requeridos:**
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant-id>`

## 🏗️ Arquitectura

El proyecto sigue Clean Architecture con las siguientes capas:

```
src/
├── domain/          # Entidades y reglas de negocio
├── application/     # Casos de uso y servicios
├── infrastructure/ # Base de datos y controladores web
├── interfaces/     # Rutas y middleware
├── config/         # Configuraciones
└── main.ts         # Punto de entrada
```

## 🔒 Seguridad

- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad
- **CORS**: Configurado para desarrollo
- **Validación**: Joi para validación de datos
- **Multitenant**: Aislamiento por tenant

## 🧪 Testing

El proyecto incluye:

- **Pruebas unitarias**: Jest + ts-jest
- **Pruebas de integración**: Supertest
- **Cobertura de código**: Jest coverage
- **Mocks**: Para dependencias externas

## 📝 Scripts Disponibles

- `npm run dev`: Desarrollo con hot reload
- `npm run build`: Compilar TypeScript
- `npm start`: Ejecutar en producción
- `npm test`: Pruebas unitarias
- `npm run test:integration`: Pruebas de integración
- `npm run test:coverage`: Cobertura de código
- `npm run lint`: Linting
- `npm run lint:fix`: Linting con auto-fix

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **DinettApp Team** - *Desarrollo inicial*

## 🙏 Agradecimientos

- Clean Architecture por Uncle Bob
- Node.js y Express.js
- MySQL y mysql2
- Jest para testing
- Swagger para documentación 