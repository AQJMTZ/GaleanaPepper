@echo off
setlocal

echo === Sistema Galeana Pepper: Script de Instalacion y Ejecucion ===
echo.

REM Verificar si Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js no esta instalado.
    echo Por favor, instala Node.js desde https://nodejs.org/ (version 18 o superior recomendada)
    exit /b 1
)

REM Verificar versión de Node.js
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
)
set NODE_MAJOR=%NODE_MAJOR:~1%

if %NODE_MAJOR% LSS 16 (
    echo Error: Se requiere Node.js v16.0.0 o superior.
    echo Tu version actual es: %NODE_VERSION%
    echo Por favor, actualiza Node.js desde https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js instalado correctamente

REM Verificar si pnpm está instalado
where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ pnpm no esta instalado. Intentando instalar...
    call npm install -g pnpm
    
    REM Verificar si la instalación fue exitosa
    where pnpm >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Error: No se pudo instalar pnpm.
        echo Por favor, intenta instalarlo manualmente con 'npm install -g pnpm'
        exit /b 1
    )
)

echo ✓ pnpm instalado correctamente

REM Cambiarse al directorio frontend
cd "%~dp0\frontend" || (
    echo Error: No se puede acceder al directorio frontend.
    exit /b 1
)

REM Instalar dependencias
echo Instalando dependencias del proyecto...
call pnpm install

REM Verificar si la instalación fue exitosa
if %ERRORLEVEL% NEQ 0 (
    echo Error: No se pudieron instalar las dependencias.
    echo Por favor, verifica tu conexion a internet e intenta de nuevo.
    exit /b 1
)

echo ✓ Dependencias instaladas correctamente

REM Iniciar el servidor de desarrollo
echo Iniciando el servidor de desarrollo...
echo Una vez que el servidor este corriendo, podras acceder a la aplicacion en:
echo http://localhost:3000
echo Presiona Ctrl+C para detener el servidor cuando hayas terminado.
echo.

REM Ejecutar el servidor de desarrollo
call pnpm dev
