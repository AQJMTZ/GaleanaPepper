# Sistema Galeana Pepper

Sistema de gestión para el proceso de producción de chiles Galeana Pepper, desde el registro inicial hasta la salida del producto.

## Requisitos

- Node.js v16.0.0 o superior
- pnpm (se instalará automáticamente si no está disponible)

## Instalación Rápida

### En macOS/Linux:

```bash
# Dar permisos de ejecución al script
chmod +x setup.sh

# Ejecutar el script de instalación
./setup.sh
```

### En Windows:

```bash
# Ejecutar el script de instalación
setup.bat
```

El script verificará automáticamente los requisitos, instalará las dependencias y ejecutará la aplicación en modo desarrollo.

## Instalación Manual

Si prefieres instalar y ejecutar manualmente, sigue estos pasos:

1. Asegúrate de tener Node.js instalado (v16.0.0 o superior)
2. Instala pnpm si no lo tienes: `npm install -g pnpm`
3. Navega al directorio frontend: `cd frontend`
4. Instala las dependencias: `pnpm install`
5. Inicia el servidor de desarrollo: `pnpm dev`

## Comandos Disponibles

Desde el directorio `/frontend`, puedes utilizar los siguientes comandos:

- `pnpm dev`: Inicia el servidor de desarrollo
- `pnpm build`: Compila la aplicación para producción
- `pnpm start`: Inicia la aplicación compilada
- `pnpm lint`: Ejecuta el linter para verificar problemas de código
- `pnpm setup`: Reinstala las dependencias
- `pnpm clean`: Elimina node_modules y .next, y reinstala dependencias (macOS/Linux)
- `pnpm clean:win`: Igual que clean pero para Windows
- `pnpm fresh-start`: Limpia la instalación y reinicia el servidor de desarrollo

## Estructura del Proyecto

- `frontend/`: Aplicación Next.js
  - `src/`: Código fuente
    - `app/`: Rutas y páginas de la aplicación
    - `components/`: Componentes reutilizables
    - `lib/`: Utilidades y conexiones (como Supabase)

## Flujo de Trabajo

El sistema implementa el siguiente flujo de trabajo:

1. **Registro Inicial**: Captura datos del proveedor y evaluación inicial
2. **Primer Pesaje**: Registro del peso bruto de entrada
3. **Vaciado**: Proceso de vaciado y tiempo en banda con evaluación de calidad
4. **Segundo Pesaje**: Registro del peso de salida
5. **Procesamiento**: Etapa final del producto

## Acceso a la Aplicación

Una vez que el servidor de desarrollo esté corriendo, puedes acceder a la aplicación en:

http://localhost:3000
