# Makefile para Galeana Pepper

# Variables
NODE_BIN := $(shell which node)
PNPM_BIN := $(shell which pnpm 2>/dev/null || echo "$(shell which npm) -g pnpm")
FRONTEND_DIR := ./frontend

# Detectar sistema operativo
ifeq ($(OS),Windows_NT)
	RM := rmdir /s /q
	INSTALL_PNPM := npm install -g pnpm
else
	RM := rm -rf
	INSTALL_PNPM := npm install -g pnpm
endif

# Targets principales
.PHONY: all setup dev build start clean fresh-start check-deps install-deps help

all: setup dev

# Verificar e instalar dependencias
check-deps:
	@echo "Verificando dependencias..."
	@if [ -z "$(NODE_BIN)" ]; then \
		echo "Error: Node.js no está instalado. Por favor, instala Node.js desde https://nodejs.org/"; \
		exit 1; \
	fi
	@if ! command -v pnpm &> /dev/null; then \
		echo "pnpm no está instalado. Instalando..."; \
		$(INSTALL_PNPM); \
	fi

install-deps: check-deps
	@echo "Instalando dependencias del proyecto..."
	@cd $(FRONTEND_DIR) && pnpm install

# Comandos principales
setup: install-deps
	@echo "Setup completado"

dev: check-deps
	@echo "Iniciando servidor de desarrollo..."
	@echo "Accede a http://localhost:3000 en tu navegador"
	@cd $(FRONTEND_DIR) && pnpm dev

build: check-deps
	@echo "Compilando la aplicación..."
	@cd $(FRONTEND_DIR) && pnpm build

start: check-deps
	@echo "Iniciando la aplicación compilada..."
	@cd $(FRONTEND_DIR) && pnpm start

clean:
	@echo "Limpiando instalación..."
	@cd $(FRONTEND_DIR) && $(RM) node_modules .next
	@make install-deps

fresh-start: clean dev

# Ayuda
help:
	@echo "Comandos disponibles:"
	@echo "  make setup        - Verifica e instala todas las dependencias"
	@echo "  make dev          - Inicia el servidor de desarrollo"
	@echo "  make build        - Compila la aplicación para producción"
	@echo "  make start        - Inicia la aplicación compilada"
	@echo "  make clean        - Elimina node_modules y .next, y reinstala dependencias"
	@echo "  make fresh-start  - Limpia la instalación y reinicia el servidor de desarrollo"
	@echo "  make help         - Muestra esta ayuda"
