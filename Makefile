# Makefile para Galeana Pepper

.PHONY: setup dev install clean fresh

# Configuración inicial completa
setup: install dev

# Instalar dependencias
install:
	@echo "📦 Instalando dependencias..."
	cd frontend && pnpm install

# Iniciar servidor de desarrollo
dev:
	@echo "🚀 Iniciando servidor de desarrollo..."
	cd frontend && pnpm dev

# Limpiar módulos y caché
clean:
	@echo "🧹 Limpiando dependencias y caché..."
	cd frontend && rm -rf node_modules .next

# Instalación limpia (eliminar todo y reinstalar)
fresh: clean install
