# Git Flow - Guía de Uso

Este proyecto utiliza **Git Flow** como metodología de gestión de ramas para mantener un flujo de trabajo organizado y eficiente.

## Estructura de Ramas

### Ramas Principales
- **`master`** - Código en producción (antes `main`)
- **`develop`** - Código en desarrollo (integración)

### Ramas de Soporte
- **`feature/*`** - Nuevas funcionalidades
- **`release/*`** - Preparación de releases
- **`hotfix/*`** - Correcciones urgentes de producción
- **`bugfix/*`** - Correcciones de bugs en desarrollo

## Flujo de Trabajo

### 1. Desarrollo de Nuevas Funcionalidades

```bash
# Crear una nueva rama feature
git flow feature start nombre-funcionalidad

# Trabajar en la funcionalidad
# ... hacer commits ...

# Finalizar la feature (merge a develop)
git flow feature finish nombre-funcionalidad
```

### 2. Preparación de Releases

```bash
# Crear rama de release
git flow release start 1.0.0

# Hacer ajustes finales (versionado, documentación)
# ... hacer commits ...

# Finalizar release (merge a master y develop)
git flow release finish 1.0.0
```

### 3. Correcciones Urgentes (Hotfix)

```bash
# Crear rama de hotfix
git flow hotfix start 1.0.1

# Corregir el problema
# ... hacer commits ...

# Finalizar hotfix (merge a master y develop)
git flow hotfix finish 1.0.1
```

### 4. Correcciones de Bugs en Desarrollo

```bash
# Crear rama de bugfix
git flow bugfix start nombre-bugfix

# Corregir el bug
# ... hacer commits ...

# Finalizar bugfix (merge a develop)
git flow bugfix finish nombre-bugfix
```

## Comandos Útiles

### Verificar Estado
```bash
# Ver todas las ramas
git branch -a

# Ver ramas activas de Git Flow
git flow feature list
git flow release list
git flow hotfix list
```

### Publicar Ramas
```bash
# Publicar feature
git flow feature publish nombre-funcionalidad

# Publicar release
git flow release publish 1.0.0

# Publicar hotfix
git flow hotfix publish 1.0.1
```

### Obtener Ramas Remotas
```bash
# Obtener feature remota
git flow feature track nombre-funcionalidad

# Obtener release remota
git flow release track 1.0.0

# Obtener hotfix remota
git flow hotfix track 1.0.1
```

## Convenciones de Nomenclatura

### Features
- `feature/nombre-descriptivo`
- Ejemplos: `feature/user-authentication`, `feature/tenant-management`

### Releases
- `release/version`
- Ejemplos: `release/1.0.0`, `release/2.1.0`

### Hotfixes
- `hotfix/version`
- Ejemplos: `hotfix/1.0.1`, `hotfix/2.1.1`

### Bugfixes
- `bugfix/descripcion-bug`
- Ejemplos: `bugfix/login-validation`, `bugfix/database-connection`

## Flujo de Integración

1. **Desarrollo**: Trabajar en ramas `feature/*`
2. **Integración**: Merge a `develop`
3. **Testing**: Probar en `develop`
4. **Release**: Crear rama `release/*` desde `develop`
5. **Producción**: Merge `release/*` a `master`
6. **Hotfix**: Correcciones urgentes desde `master`

## Configuración Actual

- **Rama de producción**: `master`
- **Rama de desarrollo**: `develop`
- **Prefijo de features**: `feature/`
- **Prefijo de releases**: `release/`
- **Prefijo de hotfixes**: `hotfix/`
- **Prefijo de bugfixes**: `bugfix/`

## Notas Importantes

- Siempre trabajar desde `develop` para nuevas funcionalidades
- Nunca hacer commits directamente en `master`
- Usar `hotfix` solo para correcciones críticas de producción
- Mantener `develop` estable y funcional
- Hacer merge de `develop` a `master` solo a través de releases 