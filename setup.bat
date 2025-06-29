@echo off
REM Script de configuración para Galeana Pepper (Windows)
echo 🌶️ Configurando el proyecto Galeana Pepper...

REM Navegar al directorio frontend
cd frontend || (echo ❌ Error: No se encontró el directorio 'frontend' && exit /b 1)

REM Verificar si pnpm está instalado
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ pnpm está instalado
    set PACKAGE_MANAGER=pnpm
) else (
    echo ⚠️ pnpm no está instalado, se usará npm
    set PACKAGE_MANAGER=npm
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
%PACKAGE_MANAGER% install

REM Iniciar la aplicación
echo 🚀 Iniciando el servidor de desarrollo...
%PACKAGE_MANAGER% run dev
