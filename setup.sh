#!/bin/bash

# Script de configuración para Galeana Pepper (macOS/Linux)
echo "🌶️ Configurando el proyecto Galeana Pepper..."

# Navegar al directorio frontend
cd frontend || { echo "❌ Error: No se encontró el directorio 'frontend'"; exit 1; }

# Verificar si pnpm está instalado
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm está instalado"
    PACKAGE_MANAGER="pnpm"
else
    echo "⚠️ pnpm no está instalado, se usará npm"
    PACKAGE_MANAGER="npm"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
$PACKAGE_MANAGER install

# Iniciar la aplicación
echo "🚀 Iniciando el servidor de desarrollo..."
$PACKAGE_MANAGER run dev
