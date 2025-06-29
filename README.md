# Galeana Pepper

Sistema de gestión para el proceso de registro, pesaje, vaciado y descarga de chile para Galeana Pepper.

## Requisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [pnpm](https://pnpm.io/installation) (recomendado) o npm

## Inicio rápido

Este proyecto incluye scripts de configuración automática para facilitar la puesta en marcha.

### Opción 1: Usando los scripts de configuración

**En macOS o Linux:**

```bash
# Dar permisos de ejecución al script
chmod +x setup.sh

# Ejecutar el script de configuración
./setup.sh
```

**En Windows:**

```
setup.bat
```

### Opción 2: Usando Make

```bash
# Instalar dependencias y ejecutar
make setup
```

### Opción 3: Instalación manual

```bash
# Entrar al directorio frontend
cd frontend

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

## Estructura del proyecto

```
frontend/
  ├── src/
  │   ├── app/             # Páginas y rutas de la aplicación
  │   │   ├── registro/    # Módulo de registro
  │   │   │   ├── inicial/     # Registro inicial
  │   │   │   ├── pesaje/      # Pesaje (primero y segundo)
  │   │   │   ├── vaciado/     # Proceso de vaciado
  │   │   │   └── descarga/    # Descarga final
  │   ├── components/      # Componentes reutilizables
  │   ├── lib/             # Utilidades y lógica de negocio
  └── .env.development     # Variables de entorno para desarrollo
```

## Variables de entorno

El proyecto incluye un archivo `.env.development` con credenciales para una base de datos de prueba. Estas credenciales se utilizan automáticamente cuando el proyecto se ejecuta en modo de desarrollo.

Si necesitas usar tus propias credenciales:

1. Crea un archivo `.env.local` en el directorio `frontend/`
2. Copia el contenido de `.env.development` y actualiza los valores

## Flujo de trabajo

El proceso sigue el siguiente flujo:

1. **Registro inicial** - Creación del folio y registro de datos básicos
2. **Primer pesaje** - Pesaje inicial del camión
3. **Vaciado** - Proceso de vaciado con control de tiempo
4. **Segundo pesaje** - Pesaje final del camión
5. **Descarga** - Finalización del proceso

## Soporte

Para dudas o problemas, contactar al equipo de desarrollo.
