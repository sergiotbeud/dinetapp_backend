# 🚀 Guía de Instalación y Uso - DinettApp Backend

## 📋 Prerrequisitos

- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **MySQL 8.0+** - [Descargar aquí](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Descargar aquí](https://git-scm.com/)

## 🛠️ Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/sergiotbeud/dinetapp_backend.git
cd dinetapp_backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=dinett_pos
DB_POOL_SIZE=10

# JWT Configuration
JWT_SECRET=tu-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configurar base de datos MySQL

#### Opción A: Usando el script automático
```bash
npm run setup:db
```

#### Opción B: Manualmente
```bash
# Conectar a MySQL
mysql -u root -p

# Crear bases de datos
CREATE DATABASE dinett_pos;
CREATE DATABASE dinett_pos_test;

# Ejecutar migraciones
mysql -u root -p dinett_pos < src/infrastructure/db/migrations/001_create_users_table.sql
mysql -u root -p dinett_pos_test < src/infrastructure/db/migrations/001_create_users_table.sql
```

### 5. Compilar el proyecto
```bash
npm run build
```

### 6. Ejecutar pruebas
```bash
# Pruebas unitarias
npm test

# Pruebas de integración
npm run test:integration

# Cobertura de código
npm run test:coverage
```

## 🏃‍♂️ Ejecutar la aplicación

### Modo desarrollo (con hot reload)
```bash
npm run dev
```

### Modo producción
```bash
npm run build
npm start
```

## 📚 Endpoints disponibles

Una vez que el servidor esté corriendo, puedes acceder a:

- **API Base**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🧪 Probar con Postman

1. **Importar la colección**:
   - Abre Postman
   - Importa el archivo `DinettApp.postman_collection.json`
   - La colección incluye ejemplos de todos los endpoints

2. **Endpoints incluidos**:
   - `GET /health` - Verificar estado del servidor
   - `POST /api/users` - Crear usuario (casos de éxito y error)
   - `GET /api/users/:id` - Obtener usuario por ID

## 🔧 Scripts disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start            # Ejecutar en producción
npm test             # Pruebas unitarias
npm run test:watch   # Pruebas en modo watch
npm run test:coverage # Cobertura de código
npm run test:integration # Pruebas de integración
npm run lint         # Linting
npm run lint:fix     # Linting con auto-fix
npm run setup:db     # Configurar base de datos
```

## 📊 Estructura del proyecto

```
dinetapp_backend/
├── src/
│   ├── domain/          # Entidades y reglas de negocio
│   ├── application/     # Casos de uso y servicios
│   ├── infrastructure/ # Base de datos y controladores
│   ├── interfaces/     # Rutas y middleware
│   └── config/         # Configuraciones
├── tests/              # Pruebas unitarias e integración
├── scripts/            # Scripts de utilidad
├── examples/           # Ejemplos de uso
└── docs/              # Documentación
```

## 🔒 Seguridad

- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad
- **CORS**: Configurado para desarrollo
- **Validación**: Joi para validación de datos
- **Multitenant**: Aislamiento por tenant

## 🐛 Troubleshooting

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo
- Revisa las credenciales en `.env`
- Si no tienes contraseña, deja `DB_PASSWORD` vacío

### Error de puerto ocupado
- Cambia el puerto en `.env` (PORT=3001)
- O mata el proceso que usa el puerto 3000

### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Ejecuta las pruebas: `npm test`
3. Verifica la configuración de la base de datos
4. Consulta la documentación en `README.md`

## 🎯 Próximos pasos

1. Implementar JWT real
2. Agregar más endpoints (UPDATE, DELETE, LIST)
3. Implementar logging estructurado
4. Configurar CI/CD
5. Desplegar en producción 