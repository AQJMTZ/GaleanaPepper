#!/bin/zsh

# Colores para mejorar la legibilidad
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "${YELLOW}=== Sistema Galeana Pepper: Script de Instalación y Ejecución ===${NC}"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "${RED}Error: Node.js no está instalado.${NC}"
    echo "Por favor, instala Node.js desde https://nodejs.org/ (versión 18 o superior recomendada)"
    exit 1
fi

# Verificar versión de Node.js (debe ser 16.0.0 o superior)
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 16 ]; then
    echo "${RED}Error: Se requiere Node.js v16.0.0 o superior.${NC}"
    echo "Tu versión actual es: $NODE_VERSION"
    echo "Por favor, actualiza Node.js desde https://nodejs.org/"
    exit 1
fi

echo "${GREEN}✓ Node.js v$NODE_VERSION instalado correctamente${NC}"

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "${YELLOW}⚠️ pnpm no está instalado. Intentando instalar...${NC}"
    npm install -g pnpm
    
    # Verificar si la instalación fue exitosa
    if ! command -v pnpm &> /dev/null; then
        echo "${RED}Error: No se pudo instalar pnpm.${NC}"
        echo "Por favor, intenta instalarlo manualmente con 'npm install -g pnpm'"
        exit 1
    fi
fi

echo "${GREEN}✓ pnpm instalado correctamente${NC}"

# Cambiarse al directorio frontend
cd "$(dirname "$0")/frontend" || {
    echo "${RED}Error: No se puede acceder al directorio frontend.${NC}"
    exit 1
}

# Instalar dependencias
echo "${YELLOW}Instalando dependencias del proyecto...${NC}"
pnpm install

# Verificar si la instalación fue exitosa
if [ $? -ne 0 ]; then
    echo "${RED}Error: No se pudieron instalar las dependencias.${NC}"
    echo "Por favor, verifica tu conexión a internet e intenta de nuevo."
    exit 1
fi

echo "${GREEN}✓ Dependencias instaladas correctamente${NC}"

# Iniciar el servidor de desarrollo
echo "${YELLOW}Iniciando el servidor de desarrollo...${NC}"
echo "${GREEN}Una vez que el servidor esté corriendo, podrás acceder a la aplicación en:${NC}"
echo "${GREEN}http://localhost:3000${NC}"
echo "${YELLOW}Presiona Ctrl+C para detener el servidor cuando hayas terminado.${NC}"
echo ""

# Ejecutar el servidor de desarrollo
pnpm dev
